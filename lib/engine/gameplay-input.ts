import type { GameViewportRect } from "./viewport";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "./viewport";

export const TAP_MOVE_THRESHOLD_PX = 10;
export const TAP_MAX_DURATION_MS = 350;

interface TapPointerState {
  pointerId: number;
  x: number;
  y: number;
  time: number;
  cancelled: boolean;
}

export function isTapGesture(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  durationMs: number,
  options?: { moveThresholdPx?: number; maxDurationMs?: number },
): boolean {
  const moveThreshold = options?.moveThresholdPx ?? TAP_MOVE_THRESHOLD_PX;
  const maxDuration = options?.maxDurationMs ?? TAP_MAX_DURATION_MS;
  if (durationMs > maxDuration) return false;
  return Math.hypot(endX - startX, endY - startY) <= moveThreshold;
}

export function createTapTracker() {
  let state: TapPointerState | null = null;

  return {
    onPointerDown(
      clientX: number,
      clientY: number,
      pointerId: number,
      options?: { ignored?: boolean; time?: number },
    ): void {
      state = {
        pointerId,
        x: clientX,
        y: clientY,
        time: options?.time ?? Date.now(),
        cancelled: options?.ignored ?? false,
      };
    },
    onPointerMove(clientX: number, clientY: number, pointerId: number): void {
      if (!state || state.pointerId !== pointerId || state.cancelled) return;
      if (Math.hypot(clientX - state.x, clientY - state.y) > TAP_MOVE_THRESHOLD_PX) {
        state.cancelled = true;
      }
    },
    onPointerUp(clientX: number, clientY: number, pointerId: number, time = Date.now()): boolean {
      if (!state || state.pointerId !== pointerId) {
        state = null;
        return false;
      }
      const isTap =
        !state.cancelled && isTapGesture(state.x, state.y, clientX, clientY, time - state.time);
      state = null;
      return isTap;
    },
    onPointerCancel(pointerId: number): void {
      if (state?.pointerId === pointerId) state = null;
    },
    reset(): void {
      state = null;
    },
  };
}

export function nudgeScrollProgress(track: HTMLElement, deltaProgress: number): void {
  const rect = track.getBoundingClientRect();
  const distance = rect.height - window.innerHeight;
  if (distance <= 0) return;
  const deltaY = deltaProgress * distance;
  window.scrollBy({ top: deltaY, behavior: "auto" });
}
export function clientToVirtual(
  clientX: number,
  clientY: number,
  viewport: GameViewportRect,
  stageRect: DOMRect,
): {
  x: number;
  y: number;
} | null {
  const localX = clientX - stageRect.left - viewport.offsetX;
  const localY = clientY - stageRect.top - viewport.offsetY;
  if (
    localX < 0 ||
    localY < 0 ||
    localX > viewport.displayWidth ||
    localY > viewport.displayHeight
  ) {
    return null;
  }
  const x = viewport.srcX + (localX / viewport.displayWidth) * viewport.srcW;
  const y = viewport.srcY + (localY / viewport.displayHeight) * viewport.srcH;
  return {
    x: Math.max(0, Math.min(DESIGN_WIDTH, x)),
    y: Math.max(0, Math.min(DESIGN_HEIGHT, y)),
  };
}
export type TapZone = "back" | "forward" | "jump";
export function classifyTapZone(
  virtualX: number,
  virtualY: number,
  width = DESIGN_WIDTH,
  height = DESIGN_HEIGHT,
): TapZone {
  if (virtualY < height * 0.28) return "jump";
  if (virtualX < width * 0.34) return "back";
  return "forward";
}
export const SCROLL_NUDGE = {
  forward: 0.019,
  back: -0.016,
  jump: 0.03,
} as const;
