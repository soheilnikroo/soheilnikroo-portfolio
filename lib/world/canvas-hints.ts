import { clamp01 } from "@/lib/engine";

export function drawTapMeHint(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  time: number,
  seed = 0,
  alpha = 1,
): void {
  const pulse = 0.5 + 0.5 * Math.sin(time / 260 + seed);
  const shake = Math.sin(time / 90 + seed * 2.1) * 2;
  const bob = Math.sin(time / 320 + seed) * 3;
  const x = Math.round(cx + shake);
  const y = Math.round(topY - 18 + bob);
  ctx.save();
  ctx.globalAlpha = clamp01(alpha) * (0.7 + pulse * 0.3);
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#000";
  ctx.fillText("TAP!", x + 1, y + 1);
  ctx.fillStyle = "#ffe08a";
  ctx.fillText("TAP!", x, y);
  ctx.textAlign = "left";
  const ay = y + 6 + pulse * 2;
  ctx.fillStyle = "#fff8e0";
  ctx.fillRect(x - 1, ay, 2, 6);
  ctx.fillRect(x - 3, ay + 4, 6, 2);
  ctx.restore();
}
export function interactionShake(time: number, seed: number, active: boolean): number {
  if (!active) return 0;
  return Math.sin(time / 85 + seed * 1.7) * 2.5;
}
