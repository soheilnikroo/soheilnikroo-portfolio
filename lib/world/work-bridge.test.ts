import { describe, expect, it } from "vitest";

import { applyCameraFocus, computeGameViewport } from "@/lib/engine/viewport";

import { workBridgeLayout, workCameraFocusX, workChapterBuildT } from "./work-bridge";

describe("workChapterBuildT", () => {
  it("finishes the bridge early so the last mystery box has scroll room before the next chapter", () => {
    expect(workChapterBuildT(0.78)).toBeLessThan(1);
    expect(workChapterBuildT(0.8)).toBe(1);
  });
});

describe("workCameraFocusX", () => {
  it("pans far enough right to keep the last mystery box in frame on a 320px phone", () => {
    const layout = workBridgeLayout(0.8, 5);
    const focusX = workCameraFocusX(layout);
    const lastBoxX = layout.spans[layout.n - 1]?.cx ?? 0;
    const viewport = applyCameraFocus(computeGameViewport(320, 568, "cover"), focusX);
    expect(viewport.srcX).toBeLessThan(lastBoxX - 20);
    expect(viewport.srcX + viewport.srcW).toBeGreaterThan(lastBoxX + 20);
  });

  it("starts nearer the character and moves toward later boxes as progress increases", () => {
    const early = workCameraFocusX(workBridgeLayout(0.2, 5));
    const late = workCameraFocusX(workBridgeLayout(0.9, 5));
    expect(late).toBeGreaterThan(early);
  });
});
