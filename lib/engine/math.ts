/**
 * Tiny math helpers for the engine. Pure functions, no allocation in the hot path.
 * Kept framework-agnostic so the engine can be unit-tested without a DOM.
 */

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Frame-rate-independent exponential smoothing ("damp"). Moves `current` toward
 * `target` so that a larger `lambda` converges faster. `dt` is in seconds.
 *
 * This is the core of the "camera, not scrollbar" feel: input expresses intent,
 * and damp() turns it into smooth motion regardless of frame timing.
 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

/** Inverse lerp: where does `v` sit between `a` and `b`, as 0..1 (unclamped). */
export function inverseLerp(a: number, b: number, v: number): number {
  return a === b ? 0 : (v - a) / (b - a);
}

/**
 * Remap `v` from [inMin,inMax] to [outMin,outMax]. With `clamped`, the result is
 * pinned to the output range — the workhorse for "this visual is a pure function
 * of scroll progress" (the basis of perfect, reversible scrubbing).
 */
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

/** Smooth Hermite easing, 0..1 → 0..1. */
export function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/**
 * Deterministic looping frame index for a cycle animation driven by progress.
 * `cycles` controls how many full loops occur across progress 0..1. Pure → a
 * given progress always yields the same frame, so scrubbing back is exact.
 */
export function loopFrame(progress: number, frameCount: number, cycles: number): number {
  if (frameCount <= 1) return 0;
  const total = Math.floor(clamp01(progress) * frameCount * cycles);
  return ((total % frameCount) + frameCount) % frameCount;
}

/** Deterministic one-shot frame index (plays once across progress 0..1, clamped). */
export function oneShotFrame(progress: number, frameCount: number): number {
  if (frameCount <= 1) return 0;
  return Math.min(frameCount - 1, Math.max(0, Math.floor(clamp01(progress) * frameCount)));
}
