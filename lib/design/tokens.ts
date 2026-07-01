export const durationsMs = {
  instant: 100,
  fast: 200,
  base: 320,
  slow: 560,
  slower: 840,
  slowest: 1200,
} as const;
export type DurationToken = keyof typeof durationsMs;
export const durations = {
  instant: durationsMs.instant / 1000,
  fast: durationsMs.fast / 1000,
  base: durationsMs.base / 1000,
  slow: durationsMs.slow / 1000,
  slower: durationsMs.slower / 1000,
  slowest: durationsMs.slowest / 1000,
} as const;
export type Cubic = readonly [number, number, number, number];
export const easings = {
  standard: [0.4, 0, 0.2, 1],
  emphasized: [0.2, 0, 0, 1],
  entrance: [0, 0, 0.2, 1],
  exit: [0.4, 0, 1, 1],
  spring: [0.34, 1.56, 0.64, 1],
} as const satisfies Record<string, Cubic>;
export type EasingToken = keyof typeof easings;
export const springs = {
  gentle: { type: "spring", stiffness: 120, damping: 20, mass: 1 },
  snappy: { type: "spring", stiffness: 320, damping: 30, mass: 0.8 },
  bouncy: { type: "spring", stiffness: 260, damping: 14, mass: 0.9 },
} as const;
export type SpringToken = keyof typeof springs;
export const zIndex = {
  base: 0,
  raised: 10,
  sticky: 100,
  nav: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  toast: 600,
  tooltip: 700,
} as const;
export type ZIndexToken = keyof typeof zIndex;
export const cssVar = {
  duration: (token: DurationToken): string => `var(--duration-${token})`,
  ease: (token: EasingToken): string => `var(--ease-${token})`,
  z: (token: ZIndexToken): string => `var(--z-${token})`,
} as const;
export function easing(token: EasingToken): [number, number, number, number] {
  const [a, b, c, d] = easings[token];
  return [a, b, c, d];
}
export const tokens = {
  durations,
  durationsMs,
  easings,
  springs,
  zIndex,
  cssVar,
  easing,
} as const;
