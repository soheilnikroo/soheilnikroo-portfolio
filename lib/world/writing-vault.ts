import { clamp01, groundY, lerp, smoothstep } from "@/lib/engine";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "@/lib/engine/viewport";

export const VAULT_POST_ZONE = { start: 0.05, end: 0.88 } as const;
const CHEST_MARGIN = 44;
export interface VaultLayout {
  readonly postN: number;
  readonly totalSlots: number;
  readonly gy: number;
  readonly rowW: number;
  readonly rowX0: number;
  readonly spacing: number;
  readonly resumeCx: number;
  readonly resumeOpen: number;
  readonly buildT: number;
}
export function vaultLayout(
  local: number,
  postCount: number,
  width = DESIGN_WIDTH,
  height = DESIGN_HEIGHT,
): VaultLayout {
  const postN = Math.min(4, Math.max(0, postCount));
  const totalSlots = postN + 1;
  const gy = groundY(height);
  const buildT = clamp01(
    (local - VAULT_POST_ZONE.start) / (VAULT_POST_ZONE.end - VAULT_POST_ZONE.start),
  );
  const rowW = width * 0.5;
  const rowX0 = width * 0.16;
  const spacing = rowW / Math.max(1, totalSlots);
  const resumeCx = Math.min(width - CHEST_MARGIN, rowX0 + spacing * 0.5);
  const resumeOpen = smoothstep(clamp01((local - 0.04) / 0.14));
  return {
    postN,
    totalSlots,
    gy,
    rowW,
    rowX0,
    spacing,
    resumeCx,
    resumeOpen,
    buildT,
  };
}
export function vaultCameraFocusX(local: number, postCount: number, width = DESIGN_WIDTH): number {
  const { rowX0, spacing, resumeCx, buildT, postN } = vaultLayout(
    local,
    postCount,
    width,
    DESIGN_HEIGHT,
  );
  if (postN === 0) return resumeCx;
  const postIdx = Math.min(postN - 1, Math.floor(buildT * postN));
  const activeCx = rowX0 + spacing * (postIdx + 1.5);
  return lerp(resumeCx, activeCx, smoothstep(buildT));
}
export function resumeChestBounds(
  layout: VaultLayout,
  time = 0,
): {
  cx: number;
  cy: number;
  w: number;
  h: number;
} | null {
  if (layout.resumeOpen < 0.35) return null;
  const size = 48;
  const lift = clamp01((layout.resumeOpen - 0.35) / 0.65);
  const scrollY = layout.gy - size - 6 - lift * 22 - Math.sin(time / 280) * 2;
  const scrollW = Math.round(14 + lift * 4);
  const scrollH = Math.round(18 + lift * 6);
  return {
    cx: layout.resumeCx,
    cy: scrollY + scrollH / 2,
    w: Math.max(scrollW + 20, size + 8),
    h: Math.max(scrollH + 20, size),
  };
}
export function hitResumeChest(
  vx: number,
  vy: number,
  local: number,
  postCount: number,
  time = 0,
): boolean {
  const layout = vaultLayout(local, postCount);
  const bounds = resumeChestBounds(layout, time);
  if (!bounds) return false;
  return Math.abs(vx - bounds.cx) < bounds.w / 2 && Math.abs(vy - bounds.cy) < bounds.h / 2;
}
export function drawTapPointer(
  ctx: CanvasRenderingContext2D,
  targetX: number,
  targetY: number,
  time: number,
  alpha = 1,
  label = "TAP",
): void {
  const bob = Math.sin(time / 320) * 3;
  const px = Math.round(targetX - 28);
  const py = Math.round(targetY + bob);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#fff8e8";
  ctx.fillRect(px, py, 4, 4);
  ctx.fillRect(px + 4, py + 4, 4, 4);
  ctx.fillRect(px + 8, py + 8, 4, 4);
  ctx.fillRect(px + 4, py + 12, 4, 4);
  ctx.fillRect(px, py + 16, 4, 4);
  ctx.strokeStyle = "#ffd080";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px + 14, py + 6);
  ctx.lineTo(targetX - 6, targetY);
  ctx.stroke();
  ctx.font = "8px monospace";
  ctx.fillStyle = "#ffd080";
  ctx.fillText(label, px - (label.length > 3 ? 8 : 2), py - 6);
  ctx.restore();
}
