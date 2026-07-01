import { clamp01 } from "@/lib/engine";

export const SKILLS_SCROLL_NUDGE = { forward: 0.022, back: -0.018, jump: 0.034 } as const;
export const SKILL_SPOTLIGHT_COUNT = 10;
export function chapterProgress(local: number, start = 0.06, end = 0.92): number {
  return clamp01((local - start) / (end - start));
}
export { clamp01 };
