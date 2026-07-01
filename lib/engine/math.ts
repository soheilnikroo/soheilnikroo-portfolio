export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}
export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}
export function inverseLerp(a: number, b: number, v: number): number {
  return a === b ? 0 : (v - a) / (b - a);
}
export function mapRange(
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  clamped = true,
): number {
  const t = inverseLerp(inMin, inMax, v);
  const u = clamped ? clamp01(t) : t;
  return lerp(outMin, outMax, u);
}
export function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}
export function loopFrame(progress: number, frameCount: number, cycles: number): number {
  if (frameCount <= 1) return 0;
  const total = Math.floor(clamp01(progress) * frameCount * cycles);
  return ((total % frameCount) + frameCount) % frameCount;
}
export function oneShotFrame(progress: number, frameCount: number): number {
  if (frameCount <= 1) return 0;
  return Math.min(frameCount - 1, Math.max(0, Math.floor(clamp01(progress) * frameCount)));
}
