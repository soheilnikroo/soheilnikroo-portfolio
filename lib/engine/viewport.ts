import { clamp } from "./math";

/**
 * Fixed design resolution for the pixel-art world camera.
 * All scene layout, parallax, and sprite placement use these constants so
 * composition is identical on every device.
 */
export const DESIGN_WIDTH = 480;
export const DESIGN_HEIGHT = 270;

/** Fraction of design height where the walkable ground line sits. */
export const GROUND_FRAC = 0.82;

export function groundY(height: number): number {
  return Math.floor(height * GROUND_FRAC);
}

export const STAGE_BG = "#05040b";

export const MAX_INTEGER_SCALE = 12;

export type ViewportFit = "contain" | "cover";

export interface GameViewportRect {
  /** CSS px — left edge of the letterboxed game area */
  readonly offsetX: number;
  /** CSS px — top edge of the letterboxed game area */
  readonly offsetY: number;
  /** CSS px — rendered width of the game area */
  readonly displayWidth: number;
  /** CSS px — rendered height of the game area */
  readonly displayHeight: number;
  /** Integer upscale factor */
  readonly scale: number;
  /** Source buffer region when using cover crop (virtual px). */
  readonly srcX: number;
  readonly srcY: number;
  readonly srcW: number;
  readonly srcH: number;
}

/** Integer uniform scale; `cover` fills the viewport (may crop edges), `contain` letterboxes. */
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

/** Pan the cover-crop window so `focusX` stays centered in the visible region. */
export function applyCameraFocus(viewport: GameViewportRect, focusX: number): GameViewportRect {
  if (viewport.srcW >= DESIGN_WIDTH) return viewport;
  const idealSrcX = focusX - viewport.srcW / 2;
  const srcX = Math.floor(clamp(idealSrcX, 0, DESIGN_WIDTH - viewport.srcW));
  return { ...viewport, srcX };
}
