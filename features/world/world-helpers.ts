import { clamp01, smoothstep } from "@/lib/engine";

export const SKILLS_SCROLL_NUDGE = { forward: 0.018, back: -0.015, jump: 0.028 } as const;
export const INTRO_SCROLL_NUDGE = { forward: 0.014, back: -0.012, jump: 0.022 } as const;
export const WORK_SCROLL_NUDGE = { forward: 0.016, back: -0.014, jump: 0.026 } as const;
export const SKILL_SPOTLIGHT_COUNT = 10;
export function chapterProgress(local: number, start = 0.06, end = 0.92): number {
  return clamp01((local - start) / (end - start));
}
export { clamp01, smoothstep };
