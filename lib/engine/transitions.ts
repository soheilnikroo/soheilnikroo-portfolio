import { clamp01 } from "./math";
import type { RenderSurface } from "./types";

/**
 * Cinematic, scroll-scrubbed transitions between chapters. Each is a pure function
 * of `coverage` (0 = clear, 1 = fully obscuring the seam), so — like everything
 * else in the engine — they play forward as you scroll down and reverse exactly as
 * you scroll up. The Stage picks a different style per chapter boundary so each
 * "world change" feels distinct.
 */
export type TransitionStyle = "pixelate" | "iris" | "bars" | "diagonal" | "glitch";

export const TRANSITION_STYLES: readonly TransitionStyle[] = [
  "iris",
  "pixelate",
  "bars",
  "diagonal",
  "glitch",
];

const COVER = "#04040b";

function hash2(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function pixelate(surface: RenderSurface, c: number): void {
  const { ctx, width, height } = surface;
  const block = 28;
  ctx.fillStyle = COVER;
  for (let gy = 0; gy < height; gy += block) {
    for (let gx = 0; gx < width; gx += block) {
      if (hash2(Math.floor(gx / block), Math.floor(gy / block)) < c) {
        ctx.fillRect(gx, gy, block + 1, block + 1);
      }
    }
  }
}

function iris(surface: RenderSurface, c: number): void {
  const { ctx, width, height } = surface;
  const maxR = Math.hypot(width, height) / 2;
  const holeR = (1 - c) * maxR;
  ctx.fillStyle = COVER;
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.arc(width / 2, height / 2, holeR, 0, Math.PI * 2, true);
  ctx.fill("evenodd");
}

function bars(surface: RenderSurface, c: number): void {
  const { ctx, width, height } = surface;
  const n = 14;
  const bw = width / n;
  const bh = c * height;
  ctx.fillStyle = COVER;
  for (let i = 0; i < n; i += 1) {
    const y = i % 2 === 0 ? 0 : height - bh;
    ctx.fillRect(Math.floor(i * bw), Math.floor(y), Math.ceil(bw) + 1, Math.ceil(bh));
  }
}

function diagonal(surface: RenderSurface, c: number): void {
  const { ctx, width, height } = surface;
  const edge = c * (width + height);
  ctx.fillStyle = COVER;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(edge, 0);
  ctx.lineTo(0, edge);
  ctx.closePath();
  ctx.fill();
}

function glitch(surface: RenderSurface, c: number): void {
  const { ctx, width, height } = surface;
  const slice = 16;
  for (let y = 0; y < height; y += slice) {
    const r = hash2(0, Math.floor(y / slice));
    if (r < c) {
      ctx.fillStyle = COVER;
      ctx.fillRect(0, y, width, slice + 1);
    } else if (r < c + 0.12) {
      // Leading colour-shifted scanline for a chromatic "glitch" edge.
      ctx.fillStyle = hash2(1, y) > 0.5 ? "rgba(129,140,248,0.5)" : "rgba(34,211,238,0.5)";
      ctx.fillRect((hash2(2, y) - 0.5) * 40, y, width, 3);
    }
  }
}

export function drawTransition(
  surface: RenderSurface,
  style: TransitionStyle,
  coverage: number,
): void {
  const c = clamp01(coverage);
  if (c <= 0.001) return;
  switch (style) {
    case "iris":
      return iris(surface, c);
    case "bars":
      return bars(surface, c);
    case "diagonal":
      return diagonal(surface, c);
    case "glitch":
      return glitch(surface, c);
    default:
      return pixelate(surface, c);
  }
}
