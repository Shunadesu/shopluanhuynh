// Calculate spins awarded based on total spent thresholds
export function calculateSpinsAwarded(prevTotalSpent, newTotalSpent) {
  const SPIN_THRESHOLD = 200000; // Mỗi 200k = 1 lượt quay

  const prevSpinCount = Math.floor(prevTotalSpent / SPIN_THRESHOLD);
  const newSpinCount = Math.floor(newTotalSpent / SPIN_THRESHOLD);
  const spinsEarned = newSpinCount - prevSpinCount;

  return spinsEarned;
}
