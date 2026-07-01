import { describe, expect, it } from "vitest";

import { applyCameraFocus, computeGameViewport, DESIGN_WIDTH } from "./viewport";

describe("applyCameraFocus", () => {
  it("shifts cover-crop toward the focal point on portrait screens", () => {
    const base = computeGameViewport(390, 844, "cover");
    expect(base.srcW).toBeLessThan(DESIGN_WIDTH);
    const centered = applyCameraFocus(base, DESIGN_WIDTH / 2);
    const right = applyCameraFocus(base, 400);
    expect(right.srcX).toBeGreaterThan(centered.srcX);
    expect(right.srcX + right.srcW).toBeLessThanOrEqual(DESIGN_WIDTH);
  });
  it("keeps a right-side character in frame on a 320px phone", () => {
    const base = computeGameViewport(320, 568, "cover");
    const introLedge = applyCameraFocus(base, 480 * 0.66);
    const introStairs = applyCameraFocus(base, 480 * 0.88);
    expect(introLedge.srcX + introLedge.srcW).toBeGreaterThan(480 * 0.66 - 20);
    expect(introStairs.srcX + introStairs.srcW).toBeGreaterThan(480 * 0.88 - 20);
    expect(introLedge.srcX).toBeLessThan(480 * 0.66);
  });
  it("keeps a left-side character in frame on a 320px phone", () => {
    const base = computeGameViewport(320, 568, "cover");
    const workSide = applyCameraFocus(base, 480 * 0.25);
    expect(workSide.srcX).toBeLessThan(480 * 0.25);
    expect(workSide.srcX + workSide.srcW).toBeGreaterThan(480 * 0.25 + 20);
  });
  it("leaves full-frame viewports unchanged", () => {
    const base = computeGameViewport(960, 540, "cover");
    expect(base.srcW).toBe(DESIGN_WIDTH);
    expect(applyCameraFocus(base, 400)).toEqual(base);
  });
});
