import type { GameViewportRect } from "./viewport";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "./viewport";

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
  forward: 0.028,
  back: -0.022,
  jump: 0.042,
} as const;
