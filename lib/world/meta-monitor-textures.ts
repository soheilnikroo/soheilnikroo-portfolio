import * as THREE from "three";

const CODE_SNIPPETS = [
  "const world = await loadScene();",
  "export function render(dt) {",
  "  camera.lookAt(desk);",
  "  return pixels;",
  "}",
  "// portfolio v0.1 — soheil",
  "pnpm dev && scroll.play()",
  "git commit -m 'ship it'",
];
const MUSIC_BARS = 12;
function drawCodeScreen(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, 0, w, h);
  ctx.font = "10px monospace";
  const scroll = (t / 40) % (CODE_SNIPPETS.length * 16);
  CODE_SNIPPETS.forEach((line, i) => {
    const y = 14 + i * 16 - scroll;
    if (y < -4 || y > h + 4) return;
    ctx.fillStyle = i % 2 === 0 ? "#7ee787" : "#79c0ff";
    ctx.fillText(line, 8, y);
  });
  ctx.fillStyle = "rgba(126, 232, 135, 0.85)";
  ctx.fillRect(8, 14 + ((t / 500) % CODE_SNIPPETS.length) * 16 - scroll, 2, 12);
}
function drawMusicScreen(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#1a0f2e");
  grad.addColorStop(1, "#0f172a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#c4b5fd";
  ctx.font = "bold 9px monospace";
  ctx.fillText("Now playing", 8, 14);
  ctx.fillStyle = "#a78bfa";
  ctx.font = "8px monospace";
  ctx.fillText("lofi — build mode", 8, 26);
  const barW = (w - 16) / MUSIC_BARS;
  for (let i = 0; i < MUSIC_BARS; i += 1) {
    const bh = 8 + Math.abs(Math.sin(t / 280 + i * 0.7)) * (h * 0.42);
    const x = 8 + i * barW;
    ctx.fillStyle = `hsl(${265 + i * 4}, 70%, ${52 + i * 2}%)`;
    ctx.fillRect(x, h - bh - 8, barW - 2, bh);
  }
}
export type SideMonitorRole = "code" | "music";

function canvasSizeForAspect(aspect: number, baseHeight = 220): { width: number; height: number } {
  const safeAspect = Number.isFinite(aspect) && aspect > 0.1 ? aspect : 16 / 10;
  return { width: Math.max(2, Math.round(baseHeight * safeAspect)), height: baseHeight };
}

function createSideMonitorCanvas(
  role: SideMonitorRole,
  width = 160,
  height = 90,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  if (role === "code") drawCodeScreen(ctx, width, height, 0);
  else drawMusicScreen(ctx, width, height, 0);
  return canvas;
}

/** Create a side monitor canvas sized to a specific screen aspect ratio. */
export function createSideMonitorCanvasForAspect(
  role: SideMonitorRole,
  aspect: number,
): HTMLCanvasElement {
  const { width, height } = canvasSizeForAspect(aspect);
  return createSideMonitorCanvas(role, width, height);
}

/**
 * Composite the live 2D game frame onto a canvas whose aspect matches the center
 * screen, using a "cover" fit so the image fills the whole surface with no gaps and
 * no stretch. The crop is biased toward the lower portion (anchorY) so the hero /
 * ground stays on screen while empty sky is trimmed instead.
 */
export function createCenterScreenCanvas(aspect: number, baseHeight = 288): HTMLCanvasElement {
  const safeAspect = Number.isFinite(aspect) && aspect > 0.1 ? aspect : 16 / 9;
  const canvas = document.createElement("canvas");
  canvas.height = baseHeight;
  canvas.width = Math.max(2, Math.round(baseHeight * safeAspect));
  return canvas;
}

export function blitGameFrame(
  dest: HTMLCanvasElement,
  source: HTMLCanvasElement,
  anchorY = 0.62,
): void {
  const ctx = dest.getContext("2d");
  if (!ctx || source.width === 0 || source.height === 0) return;
  ctx.imageSmoothingEnabled = false;
  const scale = Math.max(dest.width / source.width, dest.height / source.height);
  const drawW = source.width * scale;
  const drawH = source.height * scale;
  const dx = (dest.width - drawW) / 2;
  const dy = (dest.height - drawH) * anchorY;
  ctx.clearRect(0, 0, dest.width, dest.height);
  ctx.drawImage(source, dx, dy, drawW, drawH);
}
export function updateSideMonitorCanvas(
  canvas: HTMLCanvasElement,
  role: SideMonitorRole,
  t: number,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  if (role === "code") drawCodeScreen(ctx, canvas.width, canvas.height, t);
  else drawMusicScreen(ctx, canvas.width, canvas.height, t);
}
export function canvasToTexture(source: HTMLCanvasElement, pixelated = false): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(source);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false;
  tex.magFilter = pixelated ? THREE.NearestFilter : THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}
