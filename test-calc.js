// Simple test for the fabric calculator logic

const DEFAULT_FABRIC_SIZES = [
  { size: 2.5, weeklyDemand: 10, probability: 0 },
  { size: 3, weeklyDemand: 7, probability: 0 },
  { size: 2.25, weeklyDemand: 5, probability: 0 },
  { size: 2, weeklyDemand: 4, probability: 0 },
  { size: 5, weeklyDemand: 3, probability: 0 },
  { size: 1, weeklyDemand: 1, probability: 0 },
];

function calculateProbabilities(fabricSizes) {
  const totalWeeklyDemand = fabricSizes.reduce((sum, item) => sum + item.weeklyDemand, 0);
  return fabricSizes.map(item => ({
    ...item,
    probability: totalWeeklyDemand > 0 ? item.weeklyDemand / totalWeeklyDemand : 0
  }));
}

function findZeroLeftoverCombination(totalLength, sizes) {
  const sortedByProbability = [...sizes].sort((a, b) => b.probability - a.probability);
  
  const highPriorityThreshold = 0.15;
  const highPrioritySizes = sortedByProbability.filter(s => s.probability >= highPriorityThreshold);
  const optionalSizes = sortedByProbability.filter(s => s.probability < highPriorityThreshold);
  
  function tryWithSizes(sizesToUse) {
    // Sort sizes to process high-priority and larger sizes first
    const sortedSizes = [...sizesToUse].sort((a, b) => {
      const aPriority = a.probability >= highPriorityThreshold ? 1 : 0;
      const bPriority = b.probability >= highPriorityThreshold ? 1 : 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.probability - a.probability; // Then by probability
    });
    
    // Calculate reasonable bounds for each size based on probability and total length
    const sizeRanges = sortedSizes.map(size => {
      const maxPieces = Math.floor(totalLength / size.size);
      const isHighPriority = size.probability >= highPriorityThreshold;
      
      // More reasonable bounds based on probability and fabric efficiency
      let minPieces = 0;
      let preferredMax = maxPieces;
      
      if (isHighPriority) {
        // For high priority sizes, calculate based on their share of demand
        const estimatedNeeded = Math.ceil((totalLength * size.probability) / size.size);
        minPieces = Math.max(1, Math.min(estimatedNeeded, maxPieces));
        // Cap at reasonable amount relative to total length and size
        preferredMax = Math.min(maxPieces, Math.ceil(totalLength / size.size * 0.6));
      } else {
        // For optional sizes, be much more conservative
        preferredMax = Math.min(maxPieces, Math.ceil((totalLength * size.probability * 1.5) / size.size));
        // Small sizes shouldn't dominate
        if (size.size <= 1.5) {
          preferredMax = Math.min(preferredMax, Math.ceil(totalLength / 10));
        }
      }
      
      return {
        size: size,
        min: minPieces,
        max: preferredMax,
        absoluteMax: maxPieces
      };
    });
    
    // Try combinations, starting with larger pieces and reasonable amounts
    function tryAllCombinations(index, currentCuts, remaining, useAbsoluteMax = false) {
      if (index >= sizeRanges.length) {
        // Check if we achieved zero leftover
        if (Math.abs(remaining) < 0.001) {
          return {
            cuts: currentCuts.filter(cut => cut.pieces > 0),
            leftover: 0,
            totalUsed: totalLength
          };
        }
        return null;
      }
      
      const range = sizeRanges[index];
      const maxToUse = useAbsoluteMax ? range.absoluteMax : range.max;
      const actualMax = Math.min(maxToUse, Math.floor(remaining / range.size.size));
      
      // For high priority sizes, try higher amounts first
      // For optional sizes, try lower amounts first
      const isHighPriority = range.size.probability >= highPriorityThreshold;
      const tryOrder = [];
      
      if (isHighPriority) {
        // Try from max down to min for high priority sizes
        for (let pieces = actualMax; pieces >= range.min; pieces--) {
          tryOrder.push(pieces);
        }
      } else {
        // Try from min up to max for optional sizes  
        for (let pieces = range.min; pieces <= actualMax; pieces++) {
          tryOrder.push(pieces);
        }
      }
      
      for (const pieces of tryOrder) {
        const totalForSize = pieces * range.size.size;
        const newRemaining = remaining - totalForSize;
        
        if (newRemaining >= -0.001) { // Allow small floating point errors
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
    
    // First try with reasonable bounds
    const result = tryAllCombinations(0, [], totalLength, false);
    if (result) return result;
    
    // If that fails, try with absolute maximum bounds
    return tryAllCombinations(0, [], totalLength, true);
  }
  
  const numOptional = optionalSizes.length;
  
  for (let mask = (1 << numOptional) - 1; mask >= 0; mask--) {
    const optionalSizesToInclude = [];
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

function calculateOptimalCuts(totalLength, customFabricSizes) {
  if (totalLength <= 0) {
    return { cuts: [], leftover: 0, totalUsed: 0 };
  }

  const fabricSizes = customFabricSizes || DEFAULT_FABRIC_SIZES;
  const sizesWithProbabilities = calculateProbabilities(fabricSizes);

  const zeroLeftoverResult = findZeroLeftoverCombination(totalLength, sizesWithProbabilities);
  if (zeroLeftoverResult) {
    zeroLeftoverResult.cuts.sort((a, b) => b.size - a.size);
    return {
      ...zeroLeftoverResult,
      leftover: 0,
      totalUsed: Math.round(totalLength * 1000) / 1000
    };
  }

  return { cuts: [], leftover: totalLength, totalUsed: 0 };
}

// Test with 32.5m
console.log('Testing with 32.5m fabric:');
const result = calculateOptimalCuts(32.5);
console.log('Cuts:', result.cuts);
console.log('Leftover:', result.leftover);
console.log('Total used:', result.totalUsed);

// Verify the total
let total = 0;
result.cuts.forEach(cut => {
  console.log(`${cut.size}m x ${cut.pieces} pieces = ${cut.total}m`);
  total += cut.total;
});
console.log('Calculated total:', total);
