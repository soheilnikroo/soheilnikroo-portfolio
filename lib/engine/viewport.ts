import { clamp } from "./math";

export const DESIGN_WIDTH = 480;
export const DESIGN_HEIGHT = 270;
export const GROUND_FRAC = 0.82;
export function groundY(height: number): number {
  return Math.floor(height * GROUND_FRAC);
}
export const STAGE_BG = "#05040b";
export const MAX_INTEGER_SCALE = 12;
export type ViewportFit = "contain" | "cover";
export interface GameViewportRect {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly displayWidth: number;
  readonly displayHeight: number;
  readonly scale: number;
  readonly srcX: number;
  readonly srcY: number;
  readonly srcW: number;
  readonly srcH: number;
}
export function computeGameViewport(
  cssWidth: number,
  cssHeight: number,
  fit: ViewportFit = "cover",
): GameViewportRect {
  const scaleW = Math.floor(cssWidth / DESIGN_WIDTH);
  const scaleH = Math.floor(cssHeight / DESIGN_HEIGHT);
  const scale =
    fit === "cover"
      ? Math.max(1, Math.min(MAX_INTEGER_SCALE, Math.max(scaleW, scaleH)))
      : Math.max(1, Math.min(MAX_INTEGER_SCALE, Math.min(scaleW, scaleH)));
  const displayWidth = DESIGN_WIDTH * scale;
  const displayHeight = DESIGN_HEIGHT * scale;
  const offsetX = Math.floor((cssWidth - displayWidth) / 2);
  const offsetY = Math.floor((cssHeight - displayHeight) / 2);
  if (fit === "cover" && (displayWidth > cssWidth || displayHeight > cssHeight)) {
    const srcW = Math.min(DESIGN_WIDTH, Math.max(1, Math.ceil(cssWidth / scale)));
    const srcH = Math.min(DESIGN_HEIGHT, Math.max(1, Math.ceil(cssHeight / scale)));
    const srcX = Math.floor((DESIGN_WIDTH - srcW) / 2);
    const srcY = Math.floor((DESIGN_HEIGHT - srcH) / 2);
    return {
      offsetX: 0,
      offsetY: 0,
      displayWidth: cssWidth,
      displayHeight: cssHeight,
      scale,
      srcX,
      srcY,
      srcW,
      srcH,
    };
  }
  return {
    offsetX,
    offsetY,
    displayWidth,
    displayHeight,
    scale,
    srcX: 0,
    srcY: 0,
    srcW: DESIGN_WIDTH,
    srcH: DESIGN_HEIGHT,
  };
}
export function applyCameraFocus(viewport: GameViewportRect, focusX: number): GameViewportRect {
  if (viewport.srcW >= DESIGN_WIDTH) return viewport;
  const half = viewport.srcW / 2;
  const paddedFocus = clamp(focusX, half, DESIGN_WIDTH - half);
  const idealSrcX = paddedFocus - half;
  const srcX = Math.floor(clamp(idealSrcX, 0, DESIGN_WIDTH - viewport.srcW));
  return { ...viewport, srcX };
}
