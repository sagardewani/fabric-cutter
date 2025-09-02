export interface FabricSize {
  size: number;
  weeklyDemand: number;
  probability: number;
}

export interface CutResult {
  size: number;
  pieces: number;
  total: number;
}

export interface CalculationResult {
  cuts: CutResult[];
  leftover: number;
  totalUsed: number;
  pannaSize: number;
}

// Default weekly sales data
export const DEFAULT_FABRIC_SIZES: FabricSize[] = [
  { size: 2.5, weeklyDemand: 10, probability: 0 },
  { size: 3, weeklyDemand: 7, probability: 0 },
  { size: 2.25, weeklyDemand: 5, probability: 0 },
  { size: 2, weeklyDemand: 4, probability: 0 },
  { size: 5, weeklyDemand: 3, probability: 0 },
  { size: 1, weeklyDemand: 1, probability: 0 },
];

// Default panna size (fabric width) in centimeters
export const DEFAULT_PANNA_SIZE = 97;

function calculateProbabilities(fabricSizes: FabricSize[]): FabricSize[] {
  const totalWeeklyDemand = fabricSizes.reduce((sum, item) => sum + item.weeklyDemand, 0);
  return fabricSizes.map(item => ({
    ...item,
    probability: totalWeeklyDemand > 0 ? item.weeklyDemand / totalWeeklyDemand : 0
  }));
}

// Zero-leftover optimization function with priority-based inclusion
function findZeroLeftoverCombination(totalLength: number, sizes: FabricSize[], pannaSize: number): CalculationResult | null {
  // Sort sizes by probability (highest first) to prioritize high-demand sizes
  const sortedByProbability = [...sizes].sort((a, b) => b.probability - a.probability);
  
  // Define priority thresholds
  const highPriorityThreshold = 0.15;
  const highPrioritySizes = sortedByProbability.filter(s => s.probability >= highPriorityThreshold);
  const optionalSizes = sortedByProbability.filter(s => s.probability < highPriorityThreshold);
  
  // Simple iterative approach with priority enforcement
  function tryWithSizes(sizesToUse: FabricSize[]): CalculationResult | null {
    // Sort sizes to process high-priority sizes first, by probability
    const sortedSizes = [...sizesToUse].sort((a, b) => {
      const aPriority = a.probability >= highPriorityThreshold ? 1 : 0;
      const bPriority = b.probability >= highPriorityThreshold ? 1 : 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.probability - a.probability; // Then by probability
    });
    
    // Calculate target pieces based on probability ratios for a more proportional distribution
    const sizeRanges = sortedSizes.map(size => {
      const maxPieces = Math.floor(totalLength / size.size);
      const isHighPriority = size.probability >= highPriorityThreshold;
      
      let minPieces = 0;
      let preferredPieces = 0;
      let maxPreferred = maxPieces;
      
      if (isHighPriority) {
        // Calculate expected pieces based on probability ratio
        // Estimate total pieces needed and distribute proportionally
        const totalProbabilityMass = sortedSizes
          .filter(s => s.probability >= highPriorityThreshold)
          .reduce((sum, s) => sum + s.probability, 0);
        
        const estimatedTotalPieces = totalLength / 2.5; // rough average
        const proportionalPieces = Math.round((size.probability / totalProbabilityMass) * estimatedTotalPieces);
        
        minPieces = Math.max(1, Math.min(proportionalPieces, maxPieces));
        preferredPieces = Math.max(minPieces, Math.min(proportionalPieces + 2, maxPieces));
        maxPreferred = Math.min(maxPieces, preferredPieces + 3);
      } else {
        // For optional sizes, be conservative but allow some usage
        const estimatedPieces = Math.ceil((totalLength * size.probability * 2) / size.size);
        maxPreferred = Math.min(maxPieces, Math.max(1, estimatedPieces));
        
        // Very small sizes should be limited even more
        if (size.size <= 1.5) {
          maxPreferred = Math.min(maxPreferred, 3);
        }
      }
      
      return {
        size: size,
        min: minPieces,
        preferred: preferredPieces,
        max: maxPreferred,
        absoluteMax: maxPieces
      };
    });
    
    // Try combinations, favoring proportional distributions for priority sizes
    function tryAllCombinations(index: number, currentCuts: CutResult[], remaining: number, useAbsoluteMax: boolean = false): CalculationResult | null {
      if (index >= sizeRanges.length) {
        // Check if we achieved zero leftover
        if (Math.abs(remaining) < 0.001) {
          return {
            cuts: currentCuts.filter(cut => cut.pieces > 0),
            leftover: 0,
            totalUsed: totalLength,
            pannaSize
          };
        }
        return null;
      }
      
      const range = sizeRanges[index];
      const maxToUse = useAbsoluteMax ? range.absoluteMax : range.max;
      const actualMax = Math.min(maxToUse, Math.floor(remaining / range.size.size));
      
      const isHighPriority = range.size.probability >= highPriorityThreshold;
      const tryOrder: number[] = [];
      
      if (isHighPriority) {
        // For high priority, start with preferred amount, then try nearby values
        const preferred = Math.min(range.preferred, actualMax);
        const min = Math.max(range.min, 0);
        
        // Try preferred first
        if (preferred >= min && preferred <= actualMax) {
          tryOrder.push(preferred);
        }
        
        // Then try nearby values (prefer slightly higher for main sizes)
        for (let offset = 1; offset <= 3; offset++) {
          if (preferred + offset <= actualMax) tryOrder.push(preferred + offset);
          if (preferred - offset >= min && preferred - offset >= 0) tryOrder.push(preferred - offset);
        }
        
        // Then try remaining values from high to low
        for (let pieces = actualMax; pieces >= min; pieces--) {
          if (!tryOrder.includes(pieces)) {
            tryOrder.push(pieces);
          }
        }
      } else {
        // For optional sizes, try from low to high (minimize usage)
        for (let pieces = 0; pieces <= actualMax; pieces++) {
          tryOrder.push(pieces);
        }
      }
      
      for (const pieces of tryOrder) {
        const totalForSize = pieces * range.size.size;
        const newRemaining = remaining - totalForSize;
        
        if (newRemaining >= -0.001) {
          const newCuts = [...currentCuts];
          if (pieces > 0) {
            newCuts.push({
              size: range.size.size,
              pieces: pieces,
              total: totalForSize
            });
          }
          
          const result = tryAllCombinations(index + 1, newCuts, newRemaining, useAbsoluteMax);
          if (result) return result;
        }
      }
      
      return null;
    }
    
    // First try with preferred bounds
    const result = tryAllCombinations(0, [], totalLength, false);
    if (result) return result;
    
    // If that fails, try with absolute maximum bounds
    return tryAllCombinations(0, [], totalLength, true);
  }
  
  // Try different combinations of optional sizes
  const numOptional = optionalSizes.length;
  
  // Start with all sizes included, then try excluding optional ones
  for (let mask = (1 << numOptional) - 1; mask >= 0; mask--) {
    const optionalSizesToInclude: FabricSize[] = [];
    for (let i = 0; i < numOptional; i++) {
      if (mask & (1 << i)) {
        optionalSizesToInclude.push(optionalSizes[i]);
      }
    }
    
    const sizesToUse = [...highPrioritySizes, ...optionalSizesToInclude];
    if (sizesToUse.length === 0) continue;
    
    const result = tryWithSizes(sizesToUse);
    if (result) {
      return result;
    }
  }
  
  return null;
}

export function calculateOptimalCuts(totalLength: number, customFabricSizes?: FabricSize[], pannaSize: number = DEFAULT_PANNA_SIZE): CalculationResult {
  if (totalLength <= 0) {
    return { cuts: [], leftover: 0, totalUsed: 0, pannaSize };
  }

  // Use custom sizes if provided, otherwise use defaults
  const fabricSizes = customFabricSizes || DEFAULT_FABRIC_SIZES;
  const sizesWithProbabilities = calculateProbabilities(fabricSizes);

  // First, try to find a zero-leftover combination
  const zeroLeftoverResult = findZeroLeftoverCombination(totalLength, sizesWithProbabilities, pannaSize);
  if (zeroLeftoverResult) {
    // Sort results by size (largest first)
    zeroLeftoverResult.cuts.sort((a, b) => b.size - a.size);
    return {
      ...zeroLeftoverResult,
      leftover: 0,
      totalUsed: Math.round(totalLength * 1000) / 1000,
      pannaSize
    };
  }

  // If no zero-leftover solution found, fall back to priority-aware algorithm
  // Sort sizes by probability first, then by size for better prioritization
  const sortedSizes = [...sizesWithProbabilities].sort((a, b) => {
    // First sort by priority (high probability first)
    const aPriority = a.probability >= 0.15 ? 1 : 0;
    const bPriority = b.probability >= 0.15 ? 1 : 0;
    if (aPriority !== bPriority) return bPriority - aPriority;
    // Then by probability within same priority level
    if (Math.abs(a.probability - b.probability) > 0.01) return b.probability - a.probability;
    // Finally by size for efficiency
    return b.size - a.size;
  });
  
  // Calculate target pieces based on probabilities, ensuring priority sizes get adequate representation
  const estimatedTotalPieces = Math.floor(totalLength / 2.5); // Rough estimate
  const targetPieces = sortedSizes.map(size => ({
    ...size,
    targetCount: Math.max(
      size.probability >= 0.15 ? 1 : 0, // Minimum 1 for priority sizes
      Math.round(estimatedTotalPieces * size.probability)
    )
  }));

  let remainingLength = totalLength;
  const result: CutResult[] = [];

  // First pass: Try to meet target pieces for each size
  for (const sizeInfo of targetPieces) {
    const maxPossible = Math.floor(remainingLength / sizeInfo.size);
    const actualPieces = Math.min(maxPossible, sizeInfo.targetCount);
    
    if (actualPieces > 0) {
      const totalForSize = actualPieces * sizeInfo.size;
      result.push({
        size: sizeInfo.size,
        pieces: actualPieces,
        total: totalForSize
      });
      remainingLength -= totalForSize;
    }
  }

  // Second pass: Use remaining fabric optimally to minimize leftover
  let improved = true;
  while (improved && remainingLength >= sortedSizes[sortedSizes.length - 1].size) {
    improved = false;
    
    for (const sizeInfo of sortedSizes) {
      if (remainingLength >= sizeInfo.size) {
        const existingResult = result.find(r => r.size === sizeInfo.size);
        if (existingResult) {
          existingResult.pieces++;
          existingResult.total += sizeInfo.size;
        } else {
          result.push({
            size: sizeInfo.size,
            pieces: 1,
            total: sizeInfo.size
          });
        }
        remainingLength -= sizeInfo.size;
        improved = true;
        break;
      }
    }
  }

  // Sort results by size (largest first) and filter out zero pieces
  const finalCuts = result
    .filter(cut => cut.pieces > 0)
    .sort((a, b) => b.size - a.size);

  const totalUsed = finalCuts.reduce((sum, cut) => sum + cut.total, 0);
  const leftover = totalLength - totalUsed;

  return {
    cuts: finalCuts,
    leftover: Math.round(leftover * 1000) / 1000, // Round to 3 decimal places
    totalUsed: Math.round(totalUsed * 1000) / 1000,
    pannaSize
  };
}