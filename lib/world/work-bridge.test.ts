import { describe, expect, it } from "vitest";

import { applyCameraFocus, computeGameViewport, DESIGN_WIDTH } from "@/lib/engine/viewport";

import {
  mysteryBoxBounds,
  mysteryBoxHitTest,
  mysteryBoxOverlayStyle,
  resolveWorkViewport,
  workBridgeLayout,
  workCameraFocusX,
  workChapterBuildT,
  workMysteryBoxCount,
  WORK_CHAPTER_PROGRESS,
  WORK_MYSTERY_BOX_LIMIT,
} from "./work-bridge";

describe("workMysteryBoxCount", () => {
  it("caps mystery boxes at the work bridge limit", () => {
    expect(workMysteryBoxCount(6)).toBe(WORK_MYSTERY_BOX_LIMIT);
    expect(workMysteryBoxCount(3)).toBe(3);
    expect(workMysteryBoxCount(0)).toBe(0);
  });

  it("keeps canvas and overlay layouts aligned when more projects exist than boxes", () => {
    const local = 0.8;
    const capped = workBridgeLayout(local, workMysteryBoxCount(6));
    const uncapped = workBridgeLayout(local, 6);
    expect(capped.spans[4]!.cx).toBeCloseTo(
      workBridgeLayout(local, WORK_MYSTERY_BOX_LIMIT).spans[4]!.cx,
      0,
    );
    expect(capped.spans[4]!.cx).not.toBeCloseTo(uncapped.spans[4]!.cx, 0);
  });
});

describe("resolveWorkViewport", () => {
  it("pans the overlay crop to match the work chapter camera", () => {
    const base = computeGameViewport(320, 568, "cover");
    const resolved = resolveWorkViewport(base, 0.8, 5);
    const focus = workCameraFocusX(workBridgeLayout(0.8, 5), DESIGN_WIDTH, base.srcW);
    expect(resolved.srcX).toBe(applyCameraFocus(base, focus).srcX);
  });
});

describe("workChapterBuildT", () => {
  it("finishes the bridge early so the last mystery box has scroll room before the next chapter", () => {
    expect(workChapterBuildT(0.78)).toBeLessThan(1);
    expect(workChapterBuildT(0.8)).toBe(1);
  });
});

describe("workCameraFocusX", () => {
  it("pans far enough right to keep the last mystery box in frame on a 320px phone", () => {
    const layout = workBridgeLayout(0.8, 5);
    const viewport = computeGameViewport(320, 568, "cover");
    const focusX = workCameraFocusX(layout, DESIGN_WIDTH, viewport.srcW);
    const lastBoxX = layout.spans[layout.n - 1]?.cx ?? 0;
    const focused = applyCameraFocus(viewport, focusX);
    expect(focused.srcX).toBeLessThan(lastBoxX - 20);
    expect(focused.srcX + focused.srcW).toBeGreaterThan(lastBoxX + 20);
  });

  it("starts nearer the character and moves toward later boxes as progress increases", () => {
    const early = workCameraFocusX(workBridgeLayout(0.2, 5));
    const late = workCameraFocusX(workBridgeLayout(0.9, 5));
    expect(late).toBeGreaterThan(early);
  });

  it("stays anchored on the character at the very start of the bridge", () => {
    const layout = workBridgeLayout(0.06, 5);
    const charX = layout.gapLeft - 480 * 0.05;
    expect(workCameraFocusX(layout)).toBeCloseTo(charX, 0);
  });

  it("does not jump between adjacent scroll positions", () => {
    const n = 5;
    const gapLeft = 480 * 0.3;
    const segW = (480 * 0.94 - gapLeft) / n;
    const viewport = computeGameViewport(430, 932, "cover");
    let prev = workCameraFocusX({ buildT: 0, gapLeft, n, segW }, DESIGN_WIDTH, viewport.srcW);
    let maxStep = 0;
    for (let i = 1; i <= 200; i += 1) {
      const buildT = i / 200;
      const focus = workCameraFocusX({ buildT, gapLeft, n, segW }, DESIGN_WIDTH, viewport.srcW);
      maxStep = Math.max(maxStep, Math.abs(focus - prev));
      prev = focus;
    }
    expect(maxStep).toBeLessThan(20);
  });

  it("returns the same focus when scrolling back to a prior position", () => {
    const forward = workCameraFocusX(workBridgeLayout(0.42, 5));
    const back = workCameraFocusX(workBridgeLayout(0.42, 5));
    expect(back).toBe(forward);
  });

  it("keeps each mystery box fully visible on iPhone Pro Max while it is active", () => {
    const viewport = computeGameViewport(430, 932, "cover");
    const n = 5;
    const gapLeft = 480 * 0.3;
    const segW = (480 * 0.94 - gapLeft) / n;
    for (let i = 0; i < n; i += 1) {
      const buildT = (i + 0.55) / n;
      const layout = workBridgeLayout(
        buildT * (WORK_CHAPTER_PROGRESS.end - WORK_CHAPTER_PROGRESS.start) +
          WORK_CHAPTER_PROGRESS.start,
        n,
      );
      const span = layout.spans[i]!;
      const bounds = mysteryBoxBounds(span, 0);
      const focused = applyCameraFocus(
        viewport,
        workCameraFocusX({ buildT, gapLeft, n, segW }, DESIGN_WIDTH, viewport.srcW),
      );
      expect(bounds.left).toBeGreaterThanOrEqual(focused.srcX - 2);
      expect(bounds.right).toBeLessThanOrEqual(focused.srcX + focused.srcW + 2);
    }
  });

  it("keeps each mystery box near the center of a narrow viewport", () => {
    const viewport = computeGameViewport(320, 568, "cover");
    const n = 5;
    const gapLeft = 480 * 0.3;
    const segW = (480 * 0.94 - gapLeft) / n;
    for (let i = 0; i < n; i += 1) {
      const buildT = (i + 0.55) / n;
      const boxX = gapLeft + i * segW + segW / 2;
      const focused = applyCameraFocus(
        viewport,
        workCameraFocusX({ buildT, gapLeft, n, segW }, DESIGN_WIDTH, viewport.srcW),
      );
      const screenX = boxX - focused.srcX;
      const center = focused.srcW / 2;
      const tolerance = i === n - 1 ? focused.srcW * 0.28 : focused.srcW * 0.1;
      expect(Math.abs(screenX - center)).toBeLessThan(tolerance);
    }
  });
});

describe("mysteryBoxBounds", () => {
  it("includes the TAP hint area above the crate sprite", () => {
    const layout = workBridgeLayout(0.8, 5);
    const span = layout.spans[layout.n - 1]!;
    const bounds = mysteryBoxBounds(span, 0);
    expect(bounds.h).toBeGreaterThanOrEqual(52);
    expect(bounds.top).toBeLessThan(span.bottomY - span.size);
  });

  it("registers taps across the full crate, not just the center pixel", () => {
    const layout = workBridgeLayout(0.8, 3);
    const span = layout.spans[1]!;
    const bounds = mysteryBoxBounds(span, 1000);
    expect(mysteryBoxHitTest(bounds, bounds.left + 2, bounds.top + 2)).toBe(true);
    expect(mysteryBoxHitTest(bounds, bounds.right - 2, bounds.bottom - 2)).toBe(true);
    expect(mysteryBoxHitTest(bounds, bounds.cx, bounds.top - 4)).toBe(false);
  });
});

describe("mysteryBoxOverlayStyle", () => {
  it("offsets overlay buttons by the active camera crop", () => {
    const layout = workBridgeLayout(0.8, 5);
    const span = layout.spans[3]!;
    const bounds = mysteryBoxBounds(span, 0);
    const viewport = applyCameraFocus(
      computeGameViewport(320, 568, "cover"),
      workCameraFocusX(layout, DESIGN_WIDTH, computeGameViewport(320, 568, "cover").srcW),
    );
    const overlay = mysteryBoxOverlayStyle(bounds, viewport);
    const screenCx = bounds.cx - viewport.srcX;
    expect(Number.parseFloat(overlay.left)).toBeCloseTo((screenCx / viewport.srcW) * 100, 0);
    expect(overlay.width).toBeGreaterThan(40);
  });
});
