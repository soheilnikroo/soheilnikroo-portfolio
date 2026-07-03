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
export function vaultSlotCx(
  slot: number,
  layout: Pick<VaultLayout, "rowX0" | "spacing" | "resumeCx">,
): number {
  const { rowX0, spacing, resumeCx } = layout;
  return slot === 0 ? resumeCx - spacing * 0.1 : rowX0 + spacing * (slot + 0.5) - spacing * 0.2;
}
export interface VaultCharacterTravel {
  readonly charX: number;
  readonly cameraX: number;
  readonly walking: boolean;
  readonly walkT: number;
  readonly fromSlot: number;
  readonly toSlot: number;
}
export function vaultCharacterTravel(
  buildT: number,
  postN: number,
  layout: Pick<VaultLayout, "rowX0" | "spacing" | "resumeCx">,
): VaultCharacterTravel {
  const slotCx = (slot: number): number => vaultSlotCx(slot, layout);
  if (postN <= 0) {
    const x = slotCx(0);
    return { charX: x, cameraX: x, walking: false, walkT: 0, fromSlot: 0, toSlot: 0 };
  }
  const travel = buildT * postN;
  const fromSlot = Math.min(postN, Math.floor(travel));
  const toSlot = Math.min(postN, fromSlot + 1);
  const walkT = travel - fromSlot;
  const moveBlend = smoothstep(walkT);
  const charX = lerp(slotCx(fromSlot), slotCx(toSlot), moveBlend);
  const walking = fromSlot < toSlot && walkT > 0.04 && walkT < 0.96;
  // Hold the camera on the departure chest while walking so the character crosses the frame.
  const cameraX = walking
    ? slotCx(fromSlot) + layout.spacing * 0.32
    : charX + layout.spacing * 0.12;
  return { charX, cameraX, walking, walkT, fromSlot, toSlot };
}
export function vaultCameraFocusX(local: number, postCount: number, width = DESIGN_WIDTH): number {
  const layout = vaultLayout(local, postCount, width, DESIGN_HEIGHT);
  return vaultCharacterTravel(layout.buildT, layout.postN, layout).cameraX;
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
