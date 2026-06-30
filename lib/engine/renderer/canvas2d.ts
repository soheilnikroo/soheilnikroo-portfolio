import type { RenderSurface } from "../types";
import type { GameViewportRect } from "../viewport";
import {
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
  STAGE_BG,
  applyCameraFocus,
  computeGameViewport,
} from "../viewport";

/**
 * Canvas2D implementation of {@link RenderSurface} with a **pixel camera**.
 *
 * Scenes always draw into a fixed {@link DESIGN_WIDTH}×{@link DESIGN_HEIGHT}
 * offscreen buffer; {@link Canvas2DSurface.present} upscales it with an
 * **integer uniform scale** and letterboxes/pillarboxes to the CSS viewport.
 * Pixels never stretch non-uniformly.
 */
export class Canvas2DSurface implements RenderSurface {
  /** Buffer context — this is where scenes draw, in low-res "virtual" pixels. */
  readonly ctx: CanvasRenderingContext2D;
  /** Buffer (virtual) width — always {@link DESIGN_WIDTH}. */
  width = DESIGN_WIDTH;
  /** Buffer (virtual) height — always {@link DESIGN_HEIGHT}. */
  height = DESIGN_HEIGHT;
  dpr = 1;

  /** Letterboxed game area in CSS pixels (updated on resize). */
  viewport: GameViewportRect = {
    offsetX: 0,
    offsetY: 0,
    displayWidth: DESIGN_WIDTH,
    displayHeight: DESIGN_HEIGHT,
    scale: 1,
    srcX: 0,
    srcY: 0,
    srcW: DESIGN_WIDTH,
    srcH: DESIGN_HEIGHT,
  };

  private readonly canvas: HTMLCanvasElement;
  private readonly view: CanvasRenderingContext2D;
  private readonly buffer: HTMLCanvasElement;
  private cameraFocusX = DESIGN_WIDTH / 2;

  constructor(canvas: HTMLCanvasElement) {
    const view = canvas.getContext("2d", { alpha: false });
    if (!view) throw new Error("Canvas2D is not supported in this browser.");
    this.canvas = canvas;
    this.view = view;

    const buffer = document.createElement("canvas");
    const bctx = buffer.getContext("2d", { alpha: false });
    if (!bctx) throw new Error("Canvas2D is not supported in this browser.");
    this.buffer = buffer;
    this.ctx = bctx;

    this.buffer.width = DESIGN_WIDTH;
    this.buffer.height = DESIGN_HEIGHT;
  }

  resize(cssWidth: number, cssHeight: number, _dpr: number): void {
    this.dpr = 1;
    this.width = DESIGN_WIDTH;
    this.height = DESIGN_HEIGHT;

    // Buffer size is fixed; only recreate if dimensions drift (shouldn't happen).
    if (this.buffer.width !== DESIGN_WIDTH || this.buffer.height !== DESIGN_HEIGHT) {
      this.buffer.width = DESIGN_WIDTH;
      this.buffer.height = DESIGN_HEIGHT;
    }

    this.viewport = computeGameViewport(
      Math.max(1, Math.round(cssWidth)),
      Math.max(1, Math.round(cssHeight)),
    );

    this.canvas.width = Math.max(1, Math.round(cssWidth));
    this.canvas.height = Math.max(1, Math.round(cssHeight));
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;
    this.canvas.style.imageRendering = "pixelated";

    this.ctx.imageSmoothingEnabled = false;
    this.view.imageSmoothingEnabled = false;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  setCameraFocusX(x: number): void {
    this.cameraFocusX = x;
  }

  getGameViewport(): GameViewportRect {
    return applyCameraFocus(this.viewport, this.cameraFocusX);
  }

  present(): void {
    const { offsetX, offsetY, displayWidth, displayHeight, srcX, srcY, srcW, srcH } =
      this.getGameViewport();
    this.view.imageSmoothingEnabled = false;
    this.view.fillStyle = STAGE_BG;
    this.view.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.view.drawImage(
      this.buffer,
      srcX,
      srcY,
      srcW,
      srcH,
      offsetX,
      offsetY,
      displayWidth,
      displayHeight,
    );
  }
}
