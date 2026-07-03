import { describe, expect, it } from "vitest";

import { resolveStoryBeatIndex, segmentBeat } from "./segment-beat";

describe("segmentBeat", () => {
  it("holds each beat at full opacity longer than the old defaults", () => {
    const beat = segmentBeat(0.4, 4, 0.12, 0.91, { fadeIn: 0.06, fadeOut: 0.94 });
    expect(beat?.idx).toBe(1);
    expect(beat?.opacity).toBe(1);
  });
});

describe("resolveStoryBeatIndex", () => {
  const beats = [{ at: 0.02 }, { at: 0.08 }, { at: 0.14 }, { at: 0.24 }] as const;

  it("keeps the first caption visible across the gap before the next beat anchor", () => {
    expect(resolveStoryBeatIndex(0.04, beats)).toBe(0);
  });

  it("switches at the midpoint between beat anchors", () => {
    expect(resolveStoryBeatIndex(0.05, beats)).toBe(1);
    expect(resolveStoryBeatIndex(0.115, beats)).toBe(2);
  });
});
