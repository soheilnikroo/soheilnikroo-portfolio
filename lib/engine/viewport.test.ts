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

  it("leaves full-frame viewports unchanged", () => {
    const base = computeGameViewport(960, 540, "cover");
    expect(base.srcW).toBe(DESIGN_WIDTH);
    expect(applyCameraFocus(base, 400)).toEqual(base);
  });
});
