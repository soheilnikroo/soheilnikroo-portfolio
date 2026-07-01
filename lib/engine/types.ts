import type { GameViewportRect } from "./viewport";

export type Direction = "east" | "west";
export interface Vec2 {
  x: number;
  y: number;
}
export interface RenderSurface {
  readonly ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;
  readonly dpr: number;
  resize(width: number, height: number, dpr: number): void;
  clear(): void;
  setCameraFocusX(x: number): void;
  getGameViewport(): GameViewportRect;
  present(): void;
}
export interface WorldPalette {
  readonly skyTop: string;
  readonly skyMid: string;
  readonly skyHorizon: string;
  readonly mountains: string;
  readonly buildings: string;
  readonly windows: string;
  readonly ground: string;
  readonly tint: string;
  readonly haze?: string;
  readonly cloud?: string;
  readonly mountainNear?: string;
  readonly windowAlt?: string;
  readonly foreground?: string;
  readonly sun?: string;
  readonly particle?: string;
}
