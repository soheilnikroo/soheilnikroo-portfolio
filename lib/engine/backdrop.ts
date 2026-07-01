import type { Sprite } from "./assets";
import type { LoadedScene, SceneManifest } from "./scene-layers";
import { drawCoverLayer, drawPlacedSprite, drawTiledLayer } from "./scene-layers";
import type { RenderSurface, WorldPalette } from "./types";
import { groundY } from "./viewport";

/**
 * Atmospheric, animated, palette-driven backdrop. Pure draw functions; the city
 * scrolls with `panX`, and `time` (ms) drives ambient life (cloud drift, drifting
 * fireflies, twinkle) so the world feels alive even between scroll beats. Distant
 * layers fade toward the haze colour for depth. Designed to look hand-crafted
 * without external art; every layer is a local change to swap for tile art later.
 */

function rand(seed: number): number {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Blend two #rrggbb colours → "rgb(r,g,b)". */
export function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

function sample3(top: string, mid: string, horizon: string, t: number): string {
  return t < 0.5 ? mixHex(top, mid, t * 2) : mixHex(mid, horizon, (t - 0.5) * 2);
}

// 4×4 Bayer matrix (0..15) for ordered dithering of band seams.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/** Sky: many smooth bands with a 1px dithered seam for a crafted pixel gradient. */
export function drawSky(surface: RenderSurface, palette: WorldPalette): void {
  const { ctx, width, height } = surface;
  const gy = groundY(height);
  const bands = Math.max(10, Math.floor(gy / 10));
  for (let i = 0; i < bands; i += 1) {
    const t = i / (bands - 1);
    const y0 = Math.floor((gy * i) / bands);
    const y1 = Math.floor((gy * (i + 1)) / bands);
    ctx.fillStyle = sample3(palette.skyTop, palette.skyMid, palette.skyHorizon, t);
    ctx.fillRect(0, y0, width, y1 - y0);
    // Dither the seam toward the next band.
    if (i < bands - 1) {
      ctx.fillStyle = sample3(
        palette.skyTop,
        palette.skyMid,
        palette.skyHorizon,
        (i + 1) / (bands - 1),
      );
      for (let x = 0; x < width; x += 1) {
        if (BAYER[((x & 3) << 2) | (y1 & 3)]! < 6) ctx.fillRect(x, y1 - 1, 1, 1);
      }
    }
  }
}

/** Soft horizon haze — Tehran smog / dust at the mountain base. */
function paintHaze(surface: RenderSurface, palette: WorldPalette): void {
  const { ctx, width, height } = surface;
  const gy = groundY(height);
  const haze = palette.haze ?? palette.skyHorizon;
  const [r, g, b] = hexToRgb(haze);
  const bandH = Math.floor(gy * 0.28);
  for (let i = 0; i < bandH; i += 1) {
    const a = (i / bandH) * 0.58;
    ctx.fillStyle = `rgba(${r},${g},${b},${a.toFixed(3)})`;
    ctx.fillRect(0, gy - bandH + i, width, 1);
  }
  // Warm dusty glow at the horizon line
  const [hr, hg, hb] = hexToRgb(palette.skyHorizon);
  const glowH = Math.floor(gy * 0.08);
  for (let i = 0; i < glowH; i += 1) {
    const a = (1 - i / glowH) * 0.22;
    ctx.fillStyle = `rgba(${hr},${hg},${hb},${a.toFixed(3)})`;
    ctx.fillRect(0, gy - glowH + i, width, 1);
  }
}

export function drawStars(surface: RenderSurface, panX: number, intensity: number, time = 0): void {
  if (intensity <= 0) return;
  const { ctx, width, height } = surface;
  const gy = groundY(height);
  const offset = (panX * 0.05) % width;
  ctx.save();
  for (let i = 0; i < 80; i += 1) {
    const bx = (i * 53) % width;
    const x = bx - offset < 0 ? bx - offset + width : bx - offset;
    const y = (i * 29) % Math.floor(gy * 0.66);
    const fade = 1 - y / (gy * 0.66);
    const twinkle = 0.6 + 0.4 * Math.sin(time / 600 + i * 1.7);
    ctx.globalAlpha = (0.06 + fade * 0.55) * intensity * twinkle;
    ctx.fillStyle = "#fdf6e3";
    ctx.fillRect(Math.floor(x), y, i % 6 === 0 ? 2 : 1, i % 6 === 0 ? 2 : 1);
  }
  ctx.restore();
}

/** Drifting volumetric clouds (parallax + slow time drift). */
function paintClouds(
  surface: RenderSurface,
  panX: number,
  time: number,
  palette: WorldPalette,
): void {
  const cloud = palette.cloud;
  if (!cloud) return;
  const { ctx, width, height } = surface;
  const gy = groundY(height);
  const [r, g, b] = hexToRgb(cloud);
  ctx.save();
  for (let i = 0; i < 6; i += 1) {
    const depth = 0.08 + (i % 3) * 0.05;
    const drift = time * 0.004 * (0.5 + depth);
    const span = width + 200;
    let cx = (rand(i * 3.3) * span - (panX * depth + drift)) % span;
    if (cx < -100) cx += span;
    const cy = gy * (0.12 + rand(i * 7.7) * 0.34);
    const scale = 0.7 + rand(i * 2.1) * 0.9;
    const a = 0.1 + depth * 0.7;
    ctx.fillStyle = `rgba(${r},${g},${b},${a.toFixed(3)})`;
    const puffs = 5;
    for (let p = 0; p < puffs; p += 1) {
      const px = cx + (p - puffs / 2) * 16 * scale;
      const py = cy + Math.sin(p * 1.3 + i) * 4 * scale;
      const w = (20 + rand(i * 13 + p) * 16) * scale;
      const h = w * 0.55;
      ctx.beginPath();
      ctx.ellipse(px, py, w, h, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function drawMountains(surface: RenderSurface, panX: number, palette: WorldPalette): void {
  const { ctx, width, height } = surface;
  const gy = groundY(height);
  const haze = palette.haze ?? palette.skyHorizon;
  const ranges = [
    { depth: 0.1, amp: 0.26, step: 190, color: mixHex(palette.mountains, haze, 0.55), snow: true },
    {
      depth: 0.18,
      amp: 0.18,
      step: 150,
      color: mixHex(palette.mountains, haze, 0.25),
      snow: false,
    },
    {
      depth: 0.26,
      amp: 0.13,
      step: 120,
      color: palette.mountainNear ?? palette.mountains,
      snow: false,
    },
  ];
  for (const rg of ranges) {
    const off = panX * rg.depth;
    ctx.fillStyle = rg.color;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    const pts: Array<[number, number]> = [];
    for (let x = -rg.step; x <= width + rg.step; x += rg.step) {
      const seed = Math.floor((x + off) / rg.step);
      const px = x - (off % rg.step);
      const ridge = gy - gy * rg.amp * (0.45 + rand(seed) * 0.55);
      pts.push([px, ridge]);
      ctx.lineTo(px, ridge);
    }
    ctx.lineTo(width, gy);
    ctx.closePath();
    ctx.fill();
    // Snow caps on the far range peaks.
    if (rg.snow) {
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      for (const [px, py] of pts) {
        ctx.fillRect(Math.floor(px - 4), Math.floor(py), 9, 3);
      }
    }
  }
}

/** Tehran's Milad Tower — skyline landmark. */
export function drawMiladTower(surface: RenderSurface, panX: number, palette: WorldPalette): void {
  const { ctx, width, height } = surface;
  const gy = groundY(height);
  const x = Math.round(width * 0.72 - panX * 0.06);
  const towerH = gy * 0.72;
  const topY = gy - towerH;
  const shaftW = Math.max(7, Math.round(height * 0.011));
  const baseW = shaftW * 1.7;
  ctx.fillStyle = mixHex(palette.buildings, palette.haze ?? palette.skyHorizon, 0.18);
  ctx.beginPath();
  ctx.moveTo(x - baseW / 2, gy);
  ctx.lineTo(x - shaftW / 2, topY + towerH * 0.24);
  ctx.lineTo(x + shaftW / 2, topY + towerH * 0.24);
  ctx.lineTo(x + baseW / 2, gy);
  ctx.closePath();
  ctx.fill();
  const podW = shaftW * 3.4;
  const podY = topY + towerH * 0.16;
  const podH = towerH * 0.13;
  ctx.fillStyle = palette.buildings;
  ctx.beginPath();
  ctx.moveTo(x - podW / 2, podY + podH);
  ctx.lineTo(x - podW * 0.3, podY);
  ctx.lineTo(x + podW * 0.3, podY);
  ctx.lineTo(x + podW / 2, podY + podH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = palette.windows;
  for (let i = 0; i < 5; i += 1) {
    ctx.fillRect(
      Math.round(x - podW * 0.28 + (i * podW * 0.56) / 4),
      Math.round(podY + podH * 0.42),
      2,
      4,
    );
  }
  ctx.fillStyle = mixHex(palette.buildings, palette.haze ?? palette.skyHorizon, 0.18);
  ctx.fillRect(x - 1, Math.round(topY), 3, Math.round(towerH * 0.16));
  ctx.fillStyle = "#ff5a5a";
  ctx.fillRect(x - 1, Math.round(topY) - 5, 3, 5);
}

/** Far, hazy skyline silhouette. */
function paintSkylineFar(surface: RenderSurface, panX: number, palette: WorldPalette): void {
  const { ctx, width, height } = surface;
  const gy = groundY(height);
  const depth = 0.4;
  const off = panX * depth;
  const step = 70;
  ctx.fillStyle = mixHex(palette.buildings, palette.haze ?? palette.skyHorizon, 0.45);
  for (let i = -1; i <= width / step + 2; i += 1) {
    const seed = i + Math.floor(off / step);
    const bw = step * (0.6 + rand(seed) * 0.35);
    const bh = gy * (0.14 + rand(seed * 1.9) * 0.16);
    const x = Math.floor(i * step - (off % step));
    ctx.fillRect(x, Math.floor(gy - bh), Math.ceil(bw), Math.ceil(bh));
  }
}

export function drawBuildings(
  surface: RenderSurface,
  panX: number,
  palette: WorldPalette,
  growth = 1,
): void {
  const { ctx, width, height } = surface;
  const gy = groundY(height);
  const depth = 0.62;
  const off = panX * depth;
  const step = 132;
  const g = growth < 0 ? 0 : growth > 1 ? 1 : growth;
  const warm = palette.windows;
  const cool = palette.windowAlt ?? palette.windows;
  for (let i = -1; i <= width / step + 2; i += 1) {
    const seed = i + Math.floor(off / step);
    const appear = Math.max(0, Math.min(1, g * 1.35 - rand(seed * 5) * 0.5));
    if (appear <= 0.02) continue;
    const bw = step * (0.66 + rand(seed) * 0.3);
    const bh = gy * (0.32 + rand(seed * 2.3) * 0.34) * appear;
    const x = Math.floor(i * step - (off % step));
    const top = Math.floor(gy - bh);
    ctx.fillStyle = palette.buildings;
    ctx.fillRect(x, top, Math.ceil(bw), Math.ceil(bh));
    // Rooftop setback / water tower for silhouette variety.
    if (rand(seed * 3.1) > 0.5) {
      const sw = Math.max(6, bw * 0.2);
      ctx.fillRect(Math.floor(x + bw * 0.5 - sw / 2), top - 8, Math.ceil(sw), 8);
    }
    if (appear > 0.7) {
      const cols = Math.max(2, Math.floor(bw / 16));
      const rows = Math.max(2, Math.floor(bh / 20));
      for (let c = 0; c < cols; c += 1) {
        for (let r = 0; r < rows; r += 1) {
          const lit = rand(seed * 31 + c * 7 + r * 13);
          if (lit > 0.62) {
            ctx.fillStyle = lit > 0.82 ? warm : cool;
            ctx.fillRect(x + 7 + c * 15, top + 9 + r * 18, 5, 7);
          }
        }
      }
    }
  }
}

export function drawGround(surface: RenderSurface, panX: number, palette: WorldPalette): void {
  const { ctx, width, height } = surface;
  const gy = groundY(height);
  // Body (dirt).
  ctx.fillStyle = palette.ground;
  ctx.fillRect(0, gy, width, height - gy);
  // Lit walkable top surface — this is the line the character stands on.
  const top = mixHex(palette.ground, palette.windows, 0.3);
  ctx.fillStyle = top;
  ctx.fillRect(0, gy, width, 5);
  // Darker lip just under the surface → a readable 3D edge.
  ctx.fillStyle = mixHex(palette.ground, "#000000", 0.4);
  ctx.fillRect(0, gy + 5, width, 3);
  // Grass / rubble tufts sprouting along the edge (scroll 1:1 with the world).
  const tstep = 22;
  const toff = panX % tstep;
  ctx.fillStyle = top;
  for (let x = -tstep; x <= width + tstep; x += tstep) {
    const sx = Math.floor(x - toff);
    const seed = Math.floor((x + panX) / tstep);
    const h = 2 + Math.floor(rand(seed) * 4);
    ctx.fillRect(sx, gy - h, 2, h);
    ctx.fillRect(sx + 8, gy - Math.max(1, h - 1), 2, Math.max(1, h - 1));
  }
  // Vertical paving seams + speckle for texture.
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  const step = 56;
  const off = panX % step;
  for (let x = -step; x <= width + step; x += step) {
    ctx.fillRect(Math.floor(x - off), gy + 8, 2, height - gy);
  }
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  for (let i = 0; i < 120; i += 1) {
    const sx = (i * 37) % width;
    const sy = gy + 10 + ((i * 53) % Math.max(1, height - gy - 10));
    ctx.fillRect(sx, sy, 1, 1);
  }
}

/** Dark foreground — Tehran's plane trees (chenar) lining the street, for depth. */
function paintForeground(surface: RenderSurface, panX: number, palette: WorldPalette): void {
  const fg = palette.foreground;
  if (!fg) return;
  const { ctx, width, height } = surface;
  const gy = groundY(height);
  const off = panX * 1.35;
  ctx.fillStyle = fg;
  const step = 175;
  for (let i = -1; i <= width / step + 1; i += 1) {
    const seed = i + Math.floor(off / step);
    const x = Math.floor(i * step - (off % step) + step * 0.5);
    const th = (height - gy) * 0.6 + rand(seed) * (height - gy) * 0.5;
    const trunkTop = gy - th * 0.4;
    ctx.fillRect(x - 3, Math.round(trunkTop), 6, Math.round(height - trunkTop));
    for (let c = 0; c < 4; c += 1) {
      const cx = x + (rand(seed * 3 + c) - 0.5) * 42;
      const cy = trunkTop - rand(seed * 7 + c) * 30;
      const r = 16 + rand(seed * 5 + c) * 18;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Low bushes hugging the very bottom edge.
  const bstep = 70;
  for (let i = -1; i <= width / bstep + 1; i += 1) {
    const x = Math.floor(i * bstep - (off % bstep));
    const h = (height - gy) * 0.32;
    ctx.beginPath();
    ctx.ellipse(x + bstep * 0.5, height, bstep * 0.5, h, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  }
}

/** Mount Damavand — Iran's iconic snow-capped volcanic peak, far on the horizon. */
function paintDamavand(surface: RenderSurface, panX: number, palette: WorldPalette): void {
  const { ctx, width, height } = surface;
  const gy = groundY(height);
  const x = width * 0.32 - panX * 0.08;
  const peakY = gy * 0.12;
  const halfW = width * 0.24;
  const color = mixHex(palette.mountains, palette.haze ?? palette.skyHorizon, 0.62);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - halfW, gy);
  ctx.lineTo(x - 10, peakY);
  ctx.lineTo(x + 10, peakY);
  ctx.lineTo(x + halfW, gy);
  ctx.closePath();
  ctx.fill();
  // Snow cap with a jagged snow line.
  const capY = peakY + (gy - peakY) * 0.2;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.moveTo(x - halfW * 0.2, capY);
  ctx.lineTo(x - 9, peakY);
  ctx.lineTo(x + 9, peakY);
  ctx.lineTo(x + halfW * 0.2, capY);
  ctx.lineTo(x + halfW * 0.1, capY + 7);
  ctx.lineTo(x, capY - 2);
  ctx.lineTo(x - halfW * 0.1, capY + 7);
  ctx.closePath();
  ctx.fill();
}

/** Azadi Tower — Tehran's signature arched monument (silhouette with open arch). */
function paintAzadi(surface: RenderSurface, panX: number, palette: WorldPalette): void {
  const { ctx, width, height } = surface;
  const gy = groundY(height);
  const x = Math.round(width * 0.36 - panX * 0.42);
  const w = Math.max(44, width * 0.07);
  const h = gy * 0.3;
  const top = gy - h;
  ctx.fillStyle = mixHex(palette.buildings, palette.haze ?? palette.skyHorizon, 0.3);
  // Left + right splayed legs leave a real arch opening between them.
  ctx.beginPath();
  ctx.moveTo(x - w / 2, gy);
  ctx.lineTo(x - w * 0.16, top + h * 0.2);
  ctx.lineTo(x - w * 0.05, top + h * 0.34);
  ctx.lineTo(x - w * 0.18, gy);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + w / 2, gy);
  ctx.lineTo(x + w * 0.16, top + h * 0.2);
  ctx.lineTo(x + w * 0.05, top + h * 0.34);
  ctx.lineTo(x + w * 0.18, gy);
  ctx.closePath();
  ctx.fill();
  // Pointed top span connecting the legs.
  ctx.beginPath();
  ctx.moveTo(x - w * 0.16, top + h * 0.2);
  ctx.lineTo(x, top);
  ctx.lineTo(x + w * 0.16, top + h * 0.2);
  ctx.lineTo(x + w * 0.05, top + h * 0.34);
  ctx.lineTo(x, top + h * 0.16);
  ctx.lineTo(x - w * 0.05, top + h * 0.34);
  ctx.closePath();
  ctx.fill();
}

/** A skyline of Persian mosque domes + minarets with turquoise-tiled sheen. */
function paintDomes(surface: RenderSurface, panX: number, palette: WorldPalette): void {
  const { ctx, width, height } = surface;
  const gy = groundY(height);
  const depth = 0.5;
  const off = panX * depth;
  const step = 165;
  const color = mixHex(palette.buildings, palette.haze ?? palette.skyHorizon, 0.32);
  for (let i = -1; i <= width / step + 1; i += 1) {
    const seed = i + Math.floor(off / step);
    if (rand(seed * 9.1) < 0.5) continue;
    const x = Math.floor(i * step - (off % step) + step * 0.5);
    const baseW = step * 0.34;
    const bh = gy * 0.12;
    const top = gy - bh;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x - baseW / 2), top, Math.round(baseW), bh);
    const domeR = baseW * 0.34;
    ctx.beginPath();
    ctx.arc(x, top, domeR, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x - 1, Math.round(top - domeR - 6), 2, 7);
    ctx.fillRect(Math.round(x - baseW * 0.5 - 3), top - 9, 3, bh + 9);
    ctx.fillRect(Math.round(x + baseW * 0.5), top - 9, 3, bh + 9);
    // Turquoise tiled dome sheen.
    ctx.fillStyle = "rgba(74,200,180,0.45)";
    ctx.beginPath();
    ctx.arc(x, top, domeR * 0.62, Math.PI, 0);
    ctx.fill();
  }
}

/** Drifting fireflies / embers / motes — the layer that makes it feel alive. */
function paintParticles(
  surface: RenderSurface,
  panX: number,
  time: number,
  palette: WorldPalette,
  scale = 1,
): void {
  const particle = palette.particle;
  if (!particle || scale <= 0) return;
  const { ctx, width, height } = surface;
  const gy = groundY(height);
  const count = Math.max(0, Math.floor(36 * scale));
  ctx.save();
  for (let i = 0; i < count; i += 1) {
    const depth = 0.2 + (i % 4) * 0.12;
    const baseX = rand(i * 5.1) * width;
    const x = (baseX - panX * depth + Math.sin(time / 1400 + i) * 14) % width;
    const px = x < 0 ? x + width : x;
    const baseY = rand(i * 9.4) * gy * 0.9;
    const py = (baseY - time * 0.006 * (0.4 + depth)) % (gy * 0.95);
    const yy = py < 0 ? py + gy * 0.95 : py;
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(time / 500 + i * 2.3));
    ctx.fillStyle = `rgba(${particle},${(0.5 * tw).toFixed(3)})`;
    const s = i % 5 === 0 ? 2 : 1;
    ctx.fillRect(Math.floor(px), Math.floor(yy), s, s);
  }
  ctx.restore();
}

function paintVignette(surface: RenderSurface): void {
  const { ctx, width, height } = surface;
  // Stepped (pixel-friendly) corner darkening, no smooth blur.
  const steps = 6;
  for (let i = 0; i < steps; i += 1) {
    const a = 0.05 * (i / steps);
    ctx.fillStyle = `rgba(4,3,10,${a.toFixed(3)})`;
    const m = i * 3;
    ctx.fillRect(0, 0, width, m + 2);
    ctx.fillRect(0, height - m - 2, width, m + 2);
    ctx.fillRect(0, 0, m + 2, height);
    ctx.fillRect(width - m - 2, 0, m + 2, height);
  }
}

export function applyTint(surface: RenderSurface, tint: string): void {
  if (!tint) return;
  const { ctx, width, height } = surface;
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, width, height);
}

export interface SceneAssets {
  readonly scene: LoadedScene;
  readonly manifest: SceneManifest;
  /** Optional chapter-specific ground tile sprite. */
  readonly groundSprite?: Sprite;
}

/** Landing-chapter tweaks — richer hero backdrop, no starfield, softer foreground. */
export interface CityscapeOpts {
  /** 0 = normal, 1 = full intro landing emphasis (fades as the player scrolls). */
  readonly intro?: number;
  /** Per-layer visibility 0..1 — omit layers not listed for a simpler scene. */
  readonly layerWeights?: Readonly<Partial<Record<string, number>>>;
  /** Per-landmark visibility 0..1. */
  readonly landmarkWeights?: Readonly<Partial<Record<string, number>>>;
  /** Scale ambient particles (0 = off). */
  readonly particleScale?: number;
}

function drawProceduralCity(
  surface: RenderSurface,
  panX: number,
  palette: WorldPalette,
  growth: number,
): void {
  paintDamavand(surface, panX, palette);
  drawMountains(surface, panX, palette);
  paintAzadi(surface, panX, palette);
  paintDomes(surface, panX, palette);
  drawMiladTower(surface, panX, palette);
  paintSkylineFar(surface, panX, palette);
  drawBuildings(surface, panX, palette, growth);
  drawGround(surface, panX, palette);
  paintForeground(surface, panX, palette);
}

function drawImageCity(
  surface: RenderSurface,
  panX: number,
  palette: WorldPalette,
  growth: number,
  assets: SceneAssets,
  opts?: CityscapeOpts,
): void {
  const gy = groundY(surface.height);
  const { scene } = assets;
  const intro = opts?.intro ?? 0;
  const g = growth < 0 ? 0 : growth > 1 ? 1 : growth;
  const layerW = opts?.layerWeights;
  const landmarkW = opts?.landmarkWeights;
  const hasProfile = Boolean(layerW || landmarkW);

  const tile = (id: string) => scene.layers.get(id);

  const layerVis = (id: string): number => {
    if (layerW) return layerW[id] ?? 0;
    return hasProfile ? 0 : 1;
  };
  const landmarkVis = (id: string): number => {
    if (landmarkW) return landmarkW[id] ?? 0;
    return hasProfile ? 0 : 1;
  };

  const hero = tile("intro-hero-dawn");
  const heroOn = hero && intro > 0.06;
  const stackAlpha = heroOn ? Math.max(0, 1 - intro) : 1;

  const drawLayer = (id: string, depth: number, extra = 1): void => {
    const sprite = tile(id);
    const vis = layerVis(id) * stackAlpha * extra;
    if (sprite && vis > 0.04) drawTiledLayer(surface, sprite, panX, depth, gy, vis);
  };

  drawLayer("alborz-mountains", 0.08);
  drawLayer("tehran-skyline-far", 0.22);

  const milad = scene.landmarks.get("milad-tower");
  const miladA = landmarkVis("milad-tower") * stackAlpha;
  if (milad && miladA > 0.04) {
    drawPlacedSprite(surface, milad, 320, gy, panX, 0.06, miladA);
  }

  const azadi = scene.landmarks.get("azadi-tower");
  const azadiA = landmarkVis("azadi-tower") * stackAlpha;
  if (azadi && azadiA > 0.04) {
    drawPlacedSprite(surface, azadi, 180, gy, panX, 0.42, azadiA);
  }

  const domes = scene.landmarks.get("persian-domes");
  const domesA = landmarkVis("persian-domes") * stackAlpha;
  if (domes && domesA > 0.04) {
    drawPlacedSprite(surface, domes, 260, gy, panX, 0.5, domesA);
  }

  drawLayer("tehran-buildings-mid", 0.45, g);
  drawLayer("tehran-shopfronts", 0.72, Math.max(0, (g - 0.15) / 0.85));
  drawLayer("chenar-trees", 1.35);

  const ground = assets.groundSprite ?? tile("tehran-ground-tiles");
  const groundVis = layerW ? (layerW["tehran-ground-tiles"] ?? 1) : 1;
  if (ground && stackAlpha * groundVis > 0.06) {
    drawTiledLayer(surface, ground, panX, 1.0, gy, stackAlpha * groundVis);
  }

  if (heroOn) {
    drawCoverLayer(surface, hero, gy, Math.min(1, intro));
  }

  if (!hero && !tile("alborz-mountains") && !tile("tehran-skyline-far")) {
    drawProceduralCity(surface, panX, palette, growth);
  }
}

/** Compose the full atmospheric city in one call. */
export function drawCityscape(
  surface: RenderSurface,
  panX: number,
  palette: WorldPalette,
  starIntensity = 0,
  growth = 1,
  time = 0,
  assets?: SceneAssets,
  opts?: CityscapeOpts,
): void {
  drawSky(surface, palette);
  drawStars(surface, panX, starIntensity, time);
  paintClouds(surface, panX, time, palette);
  paintHaze(surface, palette);

  if (assets?.scene.layers.size) {
    drawImageCity(surface, panX, palette, growth, assets, opts);
  } else {
    drawProceduralCity(surface, panX, palette, growth);
  }

  paintParticles(surface, panX, time, palette, opts?.particleScale ?? 1);
  paintVignette(surface);
}
