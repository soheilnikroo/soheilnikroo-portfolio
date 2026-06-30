import { describe, expect, it } from "vitest";

import { DESIGN_WIDTH } from "@/lib/engine/viewport";

import { hitResumeChest, resumeChestBounds, vaultCameraFocusX, vaultLayout } from "./writing-vault";

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

describe("hitResumeChest", () => {
  it("hits the first chest when it is open", () => {
    const local = 0.25;
    const layout = vaultLayout(local, 1);
    const bounds = resumeChestBounds(layout);
    expect(bounds).not.toBeNull();
    expect(hitResumeChest(bounds!.cx, bounds!.cy, local, 1)).toBe(true);
  });
});
