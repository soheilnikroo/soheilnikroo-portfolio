/**
 * Shared engine contracts for the scroll-linked timeline.
 *
 * The defining rule of this engine: **everything is a pure function of scroll
 * progress.** There is no velocity, no wall-clock animation timer, and no
 * accumulated simulation state. Given the same progress, the engine always
 * produces the same frame — which is exactly what makes scrolling up rewind the
 * experience perfectly.
 */

import type { GameViewportRect } from "./viewport";

export type Direction = "east" | "west";

export interface Vec2 {
  x: number;
  y: number;
}

/**
 * The drawing seam. Canvas2D is the chosen backend (pixel-perfect, zero-dependency);
 * a future WebGL surface would implement the same lifecycle. Scenes draw through
 * `ctx` in logical (CSS) pixels — device-pixel-ratio scaling is applied once.
 */
export interface RenderSurface {
  readonly ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;
  readonly dpr: number;
  resize(width: number, height: number, dpr: number): void;
  clear(): void;
  /** Horizontal focal point in virtual px — shifts cover-crop so key action stays in frame. */
  setCameraFocusX(x: number): void;
  /** Viewport used for presentation and pointer hit-testing (includes camera pan). */
  getGameViewport(): GameViewportRect;
  /** Blit the low-resolution render buffer to the visible canvas (nearest-neighbor). */
  present(): void;
}

/**
 * A reusable colour world for a chapter (drives the procedural backdrop + tint).
 * The optional fields enable a richer, atmospheric render (haze, clouds, glow,
 * fireflies, foreground silhouette); the backdrop falls back gracefully when they
 * are omitted.
 */
export interface WorldPalette {
  readonly skyTop: string;
  readonly skyMid: string;
  readonly skyHorizon: string;
  readonly mountains: string;
  readonly buildings: string;
  readonly windows: string;
  readonly ground: string;
  /** Global wash applied over the whole frame to unify the chapter's mood. */
  readonly tint: string;
  /** Atmospheric horizon haze colour (defaults to skyHorizon). */
  readonly haze?: string;
  /** Cloud body colour. */
  readonly cloud?: string;
  /** Nearer mountain range colour (defaults to mountains). */
  readonly mountainNear?: string;
  /** Cool/alternate window colour for variety. */
  readonly windowAlt?: string;
  /** Dark foreground silhouette colour. */
  readonly foreground?: string;
  /** Sun/moon glow as "r,g,b". */
  readonly sun?: string;
  /** Floating particle (firefly / ember / snow) colour as "r,g,b". */
  readonly particle?: string;
}
