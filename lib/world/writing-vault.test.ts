import { describe, expect, it } from "vitest";

import { DESIGN_WIDTH } from "@/lib/engine/viewport";

import {
  hitResumeChest,
  resumeChestBounds,
  vaultCameraFocusX,
  vaultCharacterTravel,
  vaultLayout,
} from "./writing-vault";

describe("vaultLayout", () => {
  it("places the résumé chest in slot 0 and blog posts after it", () => {
    const layout = vaultLayout(0.2, 2);
    expect(layout.totalSlots).toBe(3);
    expect(layout.postN).toBe(2);
    expect(layout.resumeCx).toBeLessThan(layout.rowX0 + layout.spacing * 1.5);
    expect(layout.resumeCx).toBeLessThanOrEqual(DESIGN_WIDTH - 44);
  });
  it("opens the résumé chest early in the chapter", () => {
    const closed = vaultLayout(0.02, 1).resumeOpen;
    const open = vaultLayout(0.2, 1).resumeOpen;
    expect(open).toBeGreaterThan(closed);
  });
});
describe("vaultCameraFocusX", () => {
  it("starts on the résumé chest and pans toward blog chests", () => {
    const start = vaultCameraFocusX(0.05, 2);
    const later = vaultCameraFocusX(0.6, 2);
    expect(later).toBeGreaterThan(start);
  });
});
describe("vaultCharacterTravel", () => {
  it("moves the character across the frame while the camera stays anchored during a walk", () => {
    const layout = vaultLayout(0.3, 3);
    const early = vaultCharacterTravel(0.22, layout.postN, layout);
    const mid = vaultCharacterTravel(0.28, layout.postN, layout);
    expect(mid.walking).toBe(true);
    expect(mid.charX).toBeGreaterThan(early.charX);
    expect(mid.cameraX).toBeCloseTo(early.cameraX, 0);
  });
});
describe("hitResumeChest", () => {
  it("hits the first chest when it is open", () => {
    const local = 0.25;
    const layout = vaultLayout(local, 1);
    const bounds = resumeChestBounds(layout);
    expect(bounds).not.toBeNull();
    expect(hitResumeChest(bounds!.cx, bounds!.cy, local, 1)).toBe(true);
  });
});
