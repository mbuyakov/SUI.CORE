export function clamp(min: number, max: number, value: number): number {
  return Math.min(Math.max(min, value), max);
}
