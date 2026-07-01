import { describe, expect, it } from "vitest";

import {
  createTapTracker,
  isTapGesture,
  TAP_MAX_DURATION_MS,
  TAP_MOVE_THRESHOLD_PX,
} from "./gameplay-input";

describe("isTapGesture", () => {
  it("accepts a short tap with minimal movement", () => {
    expect(isTapGesture(10, 20, 12, 22, 120)).toBe(true);
  });

  it("rejects movement beyond the threshold", () => {
    expect(isTapGesture(0, 0, TAP_MOVE_THRESHOLD_PX + 1, 0, 100)).toBe(false);
  });

  it("rejects gestures longer than the max duration", () => {
    expect(isTapGesture(0, 0, 0, 0, TAP_MAX_DURATION_MS + 1)).toBe(false);
  });

  it("honors custom thresholds", () => {
    expect(
      isTapGesture(0, 0, 5, 0, 500, {
        moveThresholdPx: 8,
        maxDurationMs: 600,
      }),
    ).toBe(true);
  });
});

describe("createTapTracker", () => {
  it("confirms a tap on pointer up when movement stays small", () => {
    const tracker = createTapTracker();
    tracker.onPointerDown(100, 200, 1, { time: 0 });
    tracker.onPointerMove(102, 201, 1);
    expect(tracker.onPointerUp(103, 202, 1, 150)).toBe(true);
  });

  it("cancels a tap when movement exceeds the threshold", () => {
    const tracker = createTapTracker();
    tracker.onPointerDown(0, 0, 2, { time: 0 });
    tracker.onPointerMove(20, 0, 2);
    expect(tracker.onPointerUp(20, 0, 2, 100)).toBe(false);
  });

  it("ignores pointer downs marked as ignored", () => {
    const tracker = createTapTracker();
    tracker.onPointerDown(0, 0, 3, { ignored: true, time: 0 });
    expect(tracker.onPointerUp(0, 0, 3, 100)).toBe(false);
  });

  it("clears state on pointer cancel", () => {
    const tracker = createTapTracker();
    tracker.onPointerDown(0, 0, 4, { time: 0 });
    tracker.onPointerCancel(4);
    expect(tracker.onPointerUp(0, 0, 4, 100)).toBe(false);
  });

  it("rejects mismatched pointer ids", () => {
    const tracker = createTapTracker();
    tracker.onPointerDown(0, 0, 5, { time: 0 });
    expect(tracker.onPointerUp(0, 0, 6, 100)).toBe(false);
  });
});
