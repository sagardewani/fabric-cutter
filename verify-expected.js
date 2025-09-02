// Test specifically for the expected solution: 2.5m×6, 3m×4, 2.25m×2, 1m×1
console.log('Testing expected solution:');
console.log('2.5m × 6 pieces = 15m');
console.log('3m × 4 pieces = 12m');
console.log('2.25m × 2 pieces = 4.5m');
console.log('1m × 1 piece = 1m');
console.log('Total = 32.5m');

// Let's verify this mathematically
const expected = [
  { size: 2.5, pieces: 6, total: 15 },
  { size: 3, pieces: 4, total: 12 },
  { size: 2.25, pieces: 2, total: 4.5 },
  { size: 1, pieces: 1, total: 1 }
];

const total = expected.reduce((sum, cut) => sum + cut.total, 0);
console.log('Calculated total:', total);

// Check probabilities for the default data
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

const sizesWithProbs = calculateProbabilities(DEFAULT_FABRIC_SIZES);
console.log('\nProbabilities:');
sizesWithProbs.forEach(size => {
  console.log(`${size.size}m: ${(size.probability * 100).toFixed(1)}% (${size.probability >= 0.15 ? 'Priority' : 'Optional'})`);
});
