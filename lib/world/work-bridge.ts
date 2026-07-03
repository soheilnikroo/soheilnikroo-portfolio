import { clamp01, groundY, lerp } from "@/lib/engine";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "@/lib/engine/viewport";

/** Bridge build finishes earlier so the last ? box has scroll room before the next chapter. */
export const WORK_CHAPTER_PROGRESS = { start: 0.06, end: 0.8 } as const;

export function chapterProgress(local: number, start = 0.06, end = 0.92): number {
  return clamp01((local - start) / (end - start));
}

export function workChapterBuildT(local: number): number {
  return chapterProgress(local, WORK_CHAPTER_PROGRESS.start, WORK_CHAPTER_PROGRESS.end);
}
export interface BridgeSpan {
  readonly idx: number;
  readonly cx: number;
  readonly bottomY: number;
  readonly size: number;
  readonly builtT: number;
  readonly visible: boolean;
  readonly rise: number;
}
export interface WorkBridgeLayout {
  readonly n: number;
  readonly gapLeft: number;
  readonly gapRight: number;
  readonly deckY: number;
  readonly segW: number;
  readonly buildT: number;
  readonly spans: readonly BridgeSpan[];
}
export function workBridgeLayout(
  local: number,
  projectCount: number,
  width = DESIGN_WIDTH,
  height = DESIGN_HEIGHT,
): WorkBridgeLayout {
  const n = Math.max(1, projectCount);
  const gy = groundY(height);
  const buildT = workChapterBuildT(local);
  const gapLeft = width * 0.3;
  const gapRight = width * 0.94;
  const deckY = Math.round(gy - height * 0.16);
  const segW = (gapRight - gapLeft) / n;
  const spans: BridgeSpan[] = [];
  for (let i = 0; i < n; i += 1) {
    const t = clamp01((buildT - i / n) / (1 / n));
    const rise = (1 - t) * (height * 0.55);
    spans.push({
      idx: i,
      cx: gapLeft + i * segW + segW / 2,
      bottomY: deckY + rise,
      size: Math.min(segW * 0.5, height * 0.16),
      builtT: t,
      visible: t > 0.45,
      rise,
    });
  }
  return { n, gapLeft, gapRight, deckY, segW, buildT, spans };
}

export function workCameraFocusX(
  layout: Pick<WorkBridgeLayout, "buildT" | "gapLeft" | "n" | "segW">,
  width = DESIGN_WIDTH,
): number {
  const { buildT, gapLeft, n, segW } = layout;
  const charX = gapLeft - width * 0.05;
  const cur = Math.min(n - 1, Math.floor(buildT * n));
  const segT = clamp01(buildT * n - cur);
  const activeX = gapLeft + cur * segW + segW / 2;
  const lastSegmentBoost = cur === n - 1 ? clamp01(segT * 1.25) * 0.4 : 0;
  const blend = clamp01(0.12 + ((cur + segT * 0.92) / n) * 1.08 + lastSegmentBoost);
  const rightBias = cur === n - 1 ? segW * 0.22 : 0;
  return lerp(charX, activeX + rightBias, blend);
}
export function mysteryBoxBounds(
  span: BridgeSpan,
  time = 0,
): {
  cx: number;
  cy: number;
  w: number;
  h: number;
} {
  const s = Math.max(10, Math.round(span.size));
  const bob = span.builtT >= 0.999 ? Math.sin(time / 320 + span.idx) * 2 : 0;
  const boxH = s;
  const boxTop = span.bottomY - s - bob;
  return {
    cx: span.cx,
    cy: boxTop + boxH / 2,
    w: Math.max(44, s + 16),
    h: Math.max(44, boxH + 16),
  };
}
export function virtualToPercent(
  vx: number,
  vy: number,
  width = DESIGN_WIDTH,
  height = DESIGN_HEIGHT,
): {
  xPct: number;
  yPct: number;
} {
  return {
    xPct: (vx / width) * 100,
    yPct: (vy / height) * 100,
  };
}
