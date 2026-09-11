// Calculate spins awarded based on total successful deposits (cộng dồn)
// Mỗi 200,000đ nạp thành công = 1 lượt quay
export function calculateSpinsAwarded(prevTotalDeposited, newTotalDeposited) {
  const SPIN_THRESHOLD = 200000; // Mỗi 200k = 1 lượt quay

  const prevSpinCount = Math.floor(prevTotalDeposited / SPIN_THRESHOLD);
  const newSpinCount = Math.floor(newTotalDeposited / SPIN_THRESHOLD);
  const spinsEarned = newSpinCount - prevSpinCount;

  return spinsEarned;
}
