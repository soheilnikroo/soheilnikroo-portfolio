import { clamp01, drawProp, lerp, smoothstep } from "@/lib/engine";
import type { RenderSurface } from "@/lib/engine";
import type { Sprite } from "@/lib/engine/assets";

/**
 * Meta zoom-out: the full game shrinks into a MacBook screen on your desk —
 * first-person POV with window, clock, and hot coffee.
 */

let snap: HTMLCanvasElement | null = null;
let snapCtx: CanvasRenderingContext2D | null = null;
/** Frozen rooftop/game frame — captured once when zoom begins so the laptop always shows the game. */
let frozenGameFrame: HTMLCanvasElement | null = null;

export interface DeskRevealProps {
  readonly window?: Sprite;
}

function easeOutCubic(t: number): number {
  const x = clamp01(t);
  return 1 - (1 - x) ** 3;
}

function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

/** Slight overshoot for a satisfying settle on the laptop. */
function easeOutBack(t: number): number {
  const x = clamp01(t);
  const c1 = 1.525;
  const c3 = c1 + 1;
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
}

function copyCanvas(source: HTMLCanvasElement): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = source.width;
  c.height = source.height;
  const cx = c.getContext("2d");
  if (!cx) return null;
  cx.imageSmoothingEnabled = false;
  cx.drawImage(source, 0, 0);
  return c;
}

function captureGameFrame(
  source: HTMLCanvasElement,
  w: number,
  h: number,
): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  if (!snap) {
    snap = document.createElement("canvas");
    snapCtx = snap.getContext("2d");
  }
  if (!snapCtx) return null;
  if (snap.width !== w || snap.height !== h) {
    snap.width = w;
    snap.height = h;
  }
  snapCtx.imageSmoothingEnabled = false;
  snapCtx.clearRect(0, 0, w, h);
  snapCtx.drawImage(source, 0, 0);
  return snap;
}

function drawWallClock(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  alpha: number,
): void {
  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  ctx.save();
  ctx.globalAlpha = clamp01(alpha);
  ctx.fillStyle = "#f0ece4";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2a2838";
  ctx.lineWidth = 2;
  ctx.stroke();

  const hourA = ((hours + minutes / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  const minA = (minutes / 60) * Math.PI * 2 - Math.PI / 2;
  const secA = (seconds / 60) * Math.PI * 2 - Math.PI / 2;

  ctx.strokeStyle = "#1a1830";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(hourA) * (r * 0.45), cy + Math.sin(hourA) * (r * 0.45));
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(minA) * (r * 0.65), cy + Math.sin(minA) * (r * 0.65));
  ctx.stroke();
  ctx.strokeStyle = "#c44";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(secA) * (r * 0.72), cy + Math.sin(secA) * (r * 0.72));
  ctx.stroke();
  ctx.fillStyle = "#2a2838";
  ctx.beginPath();
  ctx.arc(cx, cy, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawWindowGlow(
  ctx: CanvasRenderingContext2D,
  winX: number,
  winY: number,
  winW: number,
  winH: number,
  deskY: number,
  W: number,
  alpha: number,
): void {
  if (alpha < 0.03) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  const grad = ctx.createRadialGradient(
    winX + winW * 0.5,
    winY + winH * 0.45,
    8,
    winX + winW * 0.5,
    deskY,
    W * 0.55,
  );
  grad.addColorStop(0, "rgba(255, 232, 196, 0.42)");
  grad.addColorStop(0.35, "rgba(255, 210, 150, 0.14)");
  grad.addColorStop(1, "rgba(255, 200, 140, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, deskY + 4);

  ctx.globalAlpha = alpha * 0.35;
  ctx.fillStyle = "rgba(180, 210, 255, 0.25)";
  ctx.fillRect(winX - 6, winY - 6, winW + 12, winH + 12);

  ctx.restore();
}

function drawCoffeeSteam(
  ctx: CanvasRenderingContext2D,
  mugX: number,
  mugTop: number,
  time: number,
  alpha: number,
): void {
  ctx.save();
  for (let i = 0; i < 4; i += 1) {
    const cycle = (time / 520 + i * 0.28) % 1;
    const rise = cycle * 18;
    const drift = Math.sin(time / 380 + i * 1.4) * 3;
    const x = mugX + 4 + i * 2.5 + drift;
    const y = mugTop - 2 - rise;
    const puffA = alpha * (1 - cycle) * 0.55;
    if (puffA < 0.04) continue;
    ctx.globalAlpha = puffA;
    ctx.fillStyle = "#f0f0f8";
    ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
    ctx.fillRect(Math.round(x + 1), Math.round(y - 3), 2, 2);
    ctx.fillRect(Math.round(x - 1), Math.round(y - 5), 2, 2);
  }
  ctx.restore();
}

function drawCoffeeMug(
  ctx: CanvasRenderingContext2D,
  mugX: number,
  mugY: number,
  time: number,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  drawCoffeeSteam(ctx, mugX, mugY, time, alpha);
  ctx.fillStyle = "#e8e0d0";
  ctx.fillRect(mugX, mugY, 12, 14);
  ctx.fillStyle = "#6a3828";
  ctx.fillRect(mugX + 1, mugY + 2, 10, 8);
  ctx.fillStyle = "#e8e0d0";
  ctx.fillRect(mugX + 12, mugY + 4, 3, 6);
  ctx.restore();
}

function drawDeskClutter(
  ctx: CanvasRenderingContext2D,
  W: number,
  deskY: number,
  time: number,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#2a2a34";
  ctx.fillRect(Math.round(W * 0.08), deskY - 6, Math.round(W * 0.2), 8);
  ctx.fillStyle = "#3a3a48";
  for (let i = 0; i < 7; i += 1) {
    ctx.fillRect(Math.round(W * 0.1 + i * 5), deskY - 4, 3, 3);
  }
  drawCoffeeMug(ctx, Math.round(W * 0.8), deskY - 14, time, alpha);
  ctx.fillStyle = "#c44";
  ctx.fillRect(Math.round(W * 0.7), deskY - 5, 18, 6);
  ctx.fillStyle = "#f8f0e8";
  ctx.fillRect(Math.round(W * 0.71), deskY - 4, 14, 4);
  ctx.restore();
}

function drawShoulders(ctx: CanvasRenderingContext2D, W: number, H: number, ease: number): void {
  ctx.save();
  ctx.globalAlpha = ease * 0.92;
  const cx = W * 0.5;
  const baseY = H * 0.92;
  ctx.fillStyle = "#1a1830";
  ctx.beginPath();
  ctx.moveTo(cx - W * 0.22, baseY);
  ctx.quadraticCurveTo(cx - W * 0.08, H * 0.78, cx, H * 0.82);
  ctx.quadraticCurveTo(cx + W * 0.08, H * 0.78, cx + W * 0.22, baseY);
  ctx.lineTo(cx + W * 0.18, H);
  ctx.lineTo(cx - W * 0.18, H);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2a2438";
  ctx.beginPath();
  ctx.ellipse(cx, H * 0.8, W * 0.06, H * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRadialVignette(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  W: number,
  H: number,
  strength: number,
): void {
  if (strength < 0.02) return;
  ctx.save();
  const r = Math.max(W, H) * 0.72;
  const grad = ctx.createRadialGradient(cx, cy, r * 0.22, cx, cy, r);
  grad.addColorStop(0, "rgba(6,5,12,0)");
  grad.addColorStop(0.55, `rgba(6,5,12,${(strength * 0.35).toFixed(3)})`);
  grad.addColorStop(1, `rgba(2,2,8,${strength.toFixed(3)})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawLetterbox(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  barH: number,
  alpha: number,
): void {
  if (barH < 1 || alpha < 0.02) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#040308";
  ctx.fillRect(0, 0, W, barH);
  ctx.fillRect(0, H - barH, W, barH);
  ctx.restore();
}

/** MacBook bezel + keyboard — hollow center so game pixels stay visible. */
function drawMacBookChassis(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  screenW: number,
  screenH: number,
  alpha: number,
): void {
  const bez = Math.max(5, Math.round(screenH * 0.042));
  const lidX = screenX - bez;
  const lidY = screenY - bez - 5;
  const lidW = screenW + bez * 2;
  const baseH = Math.max(6, Math.round(screenH * 0.08));
  const baseY = screenY + screenH + bez - 2;
  const baseW = lidW + Math.round(screenW * 0.06);
  const baseX = Math.round(lidX - (baseW - lidW) / 2);

  ctx.save();
  ctx.globalAlpha = alpha;

  const silver = "#c4c8d0";
  const silverDark = "#a8acb4";
  const silverHi = "#dce0e8";

  ctx.fillStyle = silver;
  ctx.fillRect(lidX, lidY, lidW, bez + 5);
  ctx.fillStyle = silverDark;
  ctx.fillRect(lidX, lidY, lidW, 2);
  ctx.fillStyle = silverHi;
  ctx.fillRect(lidX, lidY + 2, lidW, 1);
  ctx.fillStyle = "#2a2a34";
  ctx.fillRect(Math.round(screenX + screenW / 2 - 4), lidY + 3, 8, 3);

  ctx.fillStyle = silver;
  ctx.fillRect(lidX, lidY + bez + 5, bez, screenH);
  ctx.fillRect(screenX + screenW, lidY + bez + 5, bez, screenH);
  ctx.fillRect(lidX, screenY + screenH, lidW, bez);

  ctx.fillStyle = "#b0b4bc";
  ctx.fillRect(baseX, baseY, baseW, baseH);
  ctx.fillStyle = "#989ca4";
  ctx.fillRect(baseX, baseY + baseH - 2, baseW, 2);

  const tpW = Math.round(screenW * 0.28);
  const tpH = Math.max(3, baseH - 3);
  ctx.fillStyle = "#a4a8b0";
  ctx.fillRect(Math.round(screenX + screenW / 2 - tpW / 2), baseY + 1, tpW, tpH);

  ctx.restore();
}

function drawScreenGlow(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  screenW: number,
  screenH: number,
  alpha: number,
): void {
  if (alpha < 0.03) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const pad = Math.max(8, Math.round(screenW * 0.04));
  const grad = ctx.createRadialGradient(
    screenX + screenW / 2,
    screenY + screenH / 2,
    screenW * 0.1,
    screenX + screenW / 2,
    screenY + screenH / 2,
    screenW * 0.65,
  );
  grad.addColorStop(0, "rgba(140, 180, 255, 0.22)");
  grad.addColorStop(1, "rgba(80, 120, 200, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(screenX - pad, screenY - pad, screenW + pad * 2, screenH + pad * 2);
  ctx.restore();
}

function drawGameInScreen(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  screenW: number,
  screenH: number,
  picture: HTMLCanvasElement | null,
  alpha: number,
  glow = 0,
): void {
  if (!picture || screenW < 4 || screenH < 4) return;

  if (glow > 0.02) {
    ctx.save();
    ctx.globalAlpha = glow * 0.35;
    ctx.strokeStyle = "rgba(200, 220, 255, 0.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX - 1, screenY - 1, screenW + 2, screenH + 2);
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#0a0a10";
  ctx.fillRect(screenX, screenY, screenW, screenH);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    picture,
    0,
    0,
    picture.width,
    picture.height,
    screenX + 1,
    screenY + 1,
    screenW - 2,
    screenH - 2,
  );
  ctx.globalAlpha = alpha * 0.1;
  for (let y = screenY; y < screenY + screenH; y += 2) {
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(screenX, y, screenW, 1);
  }
  ctx.restore();
}

export function drawDeskReveal(
  surface: RenderSurface,
  t: number,
  props?: DeskRevealProps,
  time = 0,
): void {
  const reveal = clamp01(t);
  if (reveal <= 0) {
    frozenGameFrame = null;
    return;
  }

  const ctx = surface.ctx;
  const W = surface.width;
  const H = surface.height;

  if (!frozenGameFrame) {
    const fresh = captureGameFrame(ctx.canvas, W, H);
    if (fresh) frozenGameFrame = copyCanvas(fresh);
  }
  const picture = frozenGameFrame;

  const zoomPhase = easeOutCubic(reveal / 0.58);
  const settle = easeOutBack(clamp01((reveal - 0.42) / 0.58));
  const zoomT = lerp(zoomPhase, settle, smoothstep(clamp01((reveal - 0.5) / 0.5)) * 0.35);

  const laptopCx = W * 0.5;
  const finalScreenW = Math.round(W * 0.54);
  const finalScreenH = Math.round(H * 0.4);
  const finalScreenX = Math.round(laptopCx - finalScreenW / 2);
  const finalScreenY = Math.round(H * 0.22);

  const posT = easeInOutCubic(reveal / 0.62);
  const sizeT = zoomT;

  const screenW = Math.round(lerp(W, finalScreenW, sizeT));
  const screenH = Math.round(lerp(H, finalScreenH, sizeT));
  const screenX = Math.round(lerp(0, finalScreenX, posT));
  const screenY = Math.round(lerp(0, finalScreenY, posT));

  const roomIn = smoothstep(clamp01((reveal - 0.08) / 0.48));
  const deskY = Math.round(H * 0.8);
  const decorIn = smoothstep(clamp01((reveal - 0.2) / 0.45));
  const chassisIn = smoothstep(clamp01((zoomT - 0.22) / 0.58));
  const windowScale = 1.18;
  const windowX = W * 0.07;
  const windowY = H * 0.22;
  const windowW = W * 0.3;
  const windowH = H * 0.38;

  if (roomIn > 0.02) {
    ctx.save();
    ctx.globalAlpha = roomIn;
    for (let i = 0; i < 16; i += 1) {
      const f = i / 15;
      ctx.fillStyle = `rgb(${14 - f * 3},${12 - f * 3},${24 - f * 2})`;
      ctx.fillRect(0, Math.floor((H * i) / 16), W, Math.ceil(H / 16) + 1);
    }
    ctx.restore();
  }

  if (decorIn > 0.02) {
    drawWindowGlow(ctx, windowX, windowY, windowW, windowH, deskY, W, decorIn * roomIn);
  }

  if (decorIn > 0.02 && props?.window) {
    ctx.save();
    ctx.globalAlpha = decorIn * roomIn;
    drawProp(surface, props.window, windowX, windowY, windowScale);
    ctx.restore();
  }

  if (decorIn > 0.12) {
    drawWallClock(
      ctx,
      Math.round(W * 0.88),
      Math.round(H * 0.12),
      Math.round(H * 0.06),
      decorIn * roomIn,
    );
  }

  if (roomIn > 0.12) {
    ctx.save();
    ctx.globalAlpha = roomIn * 0.96;
    ctx.fillStyle = "#2a2838";
    ctx.fillRect(0, deskY, W, H - deskY);
    ctx.fillStyle = "#4a4858";
    ctx.fillRect(0, deskY, W, 2);
    ctx.restore();
  }

  const midZoom =
    smoothstep(clamp01((zoomT - 0.2) / 0.45)) * (1 - smoothstep(clamp01((zoomT - 0.75) / 0.25)));
  drawRadialVignette(ctx, screenX + screenW / 2, screenY + screenH / 2, W, H, midZoom * 0.72);

  const letterH = Math.round(lerp(0, H * 0.07, smoothstep(zoomT * 1.1) * (1 - roomIn * 0.85)));
  drawLetterbox(ctx, W, H, letterH, smoothstep(zoomT) * 0.92);

  if (chassisIn > 0.03) {
    drawScreenGlow(ctx, screenX, screenY, screenW, screenH, chassisIn * roomIn * 0.85);
    drawMacBookChassis(ctx, screenX, screenY, screenW, screenH, chassisIn * roomIn);
  }

  const screenGlow = midZoom * 0.55 + chassisIn * 0.25;
  drawGameInScreen(ctx, screenX, screenY, screenW, screenH, picture, 1, screenGlow);

  const edgeDark = zoomT * 0.78 * (1 - roomIn * 0.35);
  if (edgeDark > 0.02) {
    ctx.save();
    ctx.fillStyle = `rgba(6,5,12,${edgeDark.toFixed(3)})`;
    const m = Math.round(lerp(0, W * 0.12, zoomT));
    ctx.fillRect(0, 0, W, m);
    ctx.fillRect(0, H - m, W, m);
    ctx.fillRect(0, 0, m, H);
    ctx.fillRect(W - m, 0, m, H);
    ctx.restore();
  }

  if (decorIn > 0.25) {
    drawDeskClutter(ctx, W, deskY, time, decorIn * roomIn);
  }

  if (zoomT > 0.55) {
    drawShoulders(ctx, W, H, smoothstep(clamp01((zoomT - 0.55) / 0.45)) * roomIn);
  }
}

/** Clear frozen frame when leaving contact chapter (scroll rewind). */
export function resetDeskReveal(): void {
  frozenGameFrame = null;
}
