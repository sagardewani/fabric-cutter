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

function calculateProbabilities(fabricSizes: FabricSize[]): FabricSize[] {
  const totalWeeklyDemand = fabricSizes.reduce((sum, item) => sum + item.weeklyDemand, 0);
  return fabricSizes.map(item => ({
    ...item,
    probability: totalWeeklyDemand > 0 ? item.weeklyDemand / totalWeeklyDemand : 0
  }));
}

export function calculateOptimalCuts(totalLength: number, customFabricSizes?: FabricSize[]): CalculationResult {
  if (totalLength <= 0) {
    return { cuts: [], leftover: 0, totalUsed: 0 };
  }

  // Use custom sizes if provided, otherwise use defaults
  const fabricSizes = customFabricSizes || DEFAULT_FABRIC_SIZES;
  const sizesWithProbabilities = calculateProbabilities(fabricSizes);

  // Sort sizes by efficiency (larger pieces first for better utilization)
  const sortedSizes = [...sizesWithProbabilities].sort((a, b) => b.size - a.size);
  
  // Calculate target pieces based on probabilities
  const estimatedTotalPieces = Math.floor(totalLength / 2.5); // Rough estimate
  const targetPieces = sortedSizes.map(size => ({
    ...size,
    targetCount: Math.round(estimatedTotalPieces * size.probability)
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

  // Second pass: Use remaining fabric optimally
  let improved = true;
  while (improved && remainingLength >= 1) {
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
    totalUsed: Math.round(totalUsed * 1000) / 1000
  };
}