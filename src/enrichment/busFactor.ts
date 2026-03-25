export function calculateBusFactor(contribs: number[]): number {
  if (contribs.length === 0) return 1;
  const totalCommits = contribs.reduce((a, b) => a + b, 0);
  let runningSum = 0;
  let count = 0;
  for (const c of contribs) {
    runningSum += c;
    count++;
    if (runningSum > totalCommits / 2) {
      return count;
    }
  }
  return count;
}
