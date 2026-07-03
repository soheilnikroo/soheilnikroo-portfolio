import { clamp01, groundY, lerp, smoothstep } from "@/lib/engine";
import { clamp } from "@/lib/engine/math";
import { applyCameraFocus, DESIGN_HEIGHT, DESIGN_WIDTH } from "@/lib/engine/viewport";
import type { GameViewportRect } from "@/lib/engine/viewport";

import { interactionShake } from "./canvas-hints";

/** Bridge build finishes earlier so the last ? box has scroll room before the next chapter. */
export const WORK_CHAPTER_PROGRESS = { start: 0.06, end: 0.8 } as const;

/** Mystery boxes shown on the work bridge — must match canvas, overlays, and hit tests. */
export const WORK_MYSTERY_BOX_LIMIT = 5;

export function workMysteryBoxCount(projectCount: number): number {
  return Math.min(Math.max(0, projectCount), WORK_MYSTERY_BOX_LIMIT);
}

/** Wooden crate sprite in `public/world/objects/work/wooden-crate.png`. */
const CRATE_SPRITE_PX = 64;
const CRATE_SCALE_DIVISOR = 48;
const TAP_HINT_PAD = 24;
const MIN_HIT_PX = 52;

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
export interface MysteryBoxBounds {
  readonly cx: number;
  readonly cy: number;
  readonly w: number;
  readonly h: number;
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
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

/** Keep the full mystery-box hit area inside a cropped mobile viewport. */
export function fitCameraFocusX(
  focusX: number,
  boundsLeft: number,
  boundsRight: number,
  srcW: number,
): number {
  if (srcW >= DESIGN_WIDTH) return focusX;
  const half = srcW / 2;
  const minFocus = boundsRight - half;
  const maxFocus = boundsLeft + half;
  if (minFocus > maxFocus) return focusX;
  return clamp(focusX, minFocus, maxFocus);
}

function mysteryBoxFramingBounds(
  index: number,
  layout: Pick<WorkBridgeLayout, "gapLeft" | "n" | "segW">,
  height = DESIGN_HEIGHT,
): { cx: number; left: number; right: number } {
  const { gapLeft, segW } = layout;
  const cx = gapLeft + index * segW + segW / 2;
  const size = Math.min(segW * 0.5, height * 0.16);
  const s = Math.max(10, Math.round(size));
  const scale = s / CRATE_SCALE_DIVISOR;
  const spriteW = CRATE_SPRITE_PX * scale;
  const w = Math.max(MIN_HIT_PX, spriteW + 20);
  return { cx, left: cx - w / 2, right: cx + w / 2 };
}

export function workCameraFocusX(
  layout: Pick<WorkBridgeLayout, "buildT" | "gapLeft" | "n" | "segW">,
  width = DESIGN_WIDTH,
  viewportSrcW = DESIGN_WIDTH,
): number {
  const { buildT, gapLeft, n, segW } = layout;
  const charX = gapLeft - width * 0.05;
  if (n <= 0 || buildT <= 0) return charX;

  const boxCx = (index: number): number => gapLeft + index * segW + segW / 2;

  if (n === 1) {
    const engage = smoothstep(clamp01((buildT - 0.02) / 0.06));
    const focusX = lerp(charX, boxCx(0), engage);
    const bounds = mysteryBoxFramingBounds(0, layout);
    return fitCameraFocusX(focusX, bounds.left, bounds.right, viewportSrcW);
  }

  const travel = buildT * n;
  const cur = Math.min(n - 1, Math.floor(travel));
  const segT = travel - cur;
  const prev = Math.max(0, cur - 1);
  const handoffWindow = 0.12;

  let frameIdx = cur;
  let boxFocus: number;
  if (cur === 0 && segT < handoffWindow) {
    boxFocus = lerp(charX, boxCx(0), smoothstep(segT / handoffWindow));
    frameIdx = 0;
  } else if (segT < handoffWindow && cur > 0) {
    boxFocus = lerp(boxCx(prev), boxCx(cur), smoothstep(segT / handoffWindow));
    frameIdx = segT < handoffWindow / 2 ? prev : cur;
  } else {
    boxFocus = boxCx(cur);
    frameIdx = cur;
  }

  const firstBoxVisible = travel >= 0.45;
  const engage = firstBoxVisible ? 1 : smoothstep(clamp01((buildT - 0.02) / 0.06));
  const focusX = lerp(charX, boxFocus, engage);
  const bounds = mysteryBoxFramingBounds(frameIdx, layout);
  return fitCameraFocusX(focusX, bounds.left, bounds.right, viewportSrcW);
}

/** Hit box aligned with `drawMysteryBox` + wooden crate sprite dimensions. */
export function mysteryBoxBounds(span: BridgeSpan, time = 0): MysteryBoxBounds {
  const s = Math.max(10, Math.round(span.size));
  const scale = s / CRATE_SCALE_DIVISOR;
  const spriteW = CRATE_SPRITE_PX * scale;
  const spriteH = CRATE_SPRITE_PX * scale;
  const built = span.builtT >= 0.999;
  const bob = built ? Math.sin(time / 320 + span.idx) * 2 : 0;
  const shake = built ? interactionShake(time, span.idx, true) : 0;
  const baseline = span.bottomY - bob + shake;
  const spriteTop = baseline - spriteH;
  const top = spriteTop - TAP_HINT_PAD;
  const bottom = baseline + 6;
  const w = Math.max(MIN_HIT_PX, spriteW + 20);
  const h = Math.max(MIN_HIT_PX, bottom - top);
  const cx = span.cx;
  const cy = top + h / 2;
  return {
    cx,
    cy,
    w,
    h,
    left: cx - w / 2,
    top,
    right: cx + w / 2,
    bottom,
  };
}

export function mysteryBoxHitTest(bounds: MysteryBoxBounds, x: number, y: number): boolean {
  return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
}

/** Camera crop for the work chapter at the current scroll position. */
export function resolveWorkViewport(
  baseViewport: GameViewportRect,
  chapterLocal: number,
  projectCount: number,
): GameViewportRect {
  const bridge = workBridgeLayout(chapterLocal, projectCount);
  return applyCameraFocus(baseViewport, workCameraFocusX(bridge, DESIGN_WIDTH, baseViewport.srcW));
}

export function mysteryBoxOverlayStyle(
  bounds: MysteryBoxBounds,
  viewport: GameViewportRect,
): {
  left: string;
  top: string;
  width: number;
  height: number;
} {
  const screenCx = bounds.cx - viewport.srcX;
  const screenCy = bounds.cy - viewport.srcY;
  const scaleX = viewport.displayWidth / viewport.srcW;
  const scaleY = viewport.displayHeight / viewport.srcH;
  return {
    left: `${(screenCx / viewport.srcW) * 100}%`,
    top: `${(screenCy / viewport.srcH) * 100}%`,
    width: bounds.w * scaleX,
    height: bounds.h * scaleY,
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
