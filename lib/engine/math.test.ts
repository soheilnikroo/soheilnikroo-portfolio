import { describe, expect, it } from "vitest";

import { clamp, clamp01, lerp, loopFrame, mapRange, smoothstep } from "./math";

describe("engine math", () => {
  it("clamps values", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  it("lerps between endpoints", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  it("clamp01 pins to 0..1", () => {
    expect(clamp01(-2)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(3)).toBe(1);
  });

  it("smoothstep eases at the ends", () => {
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(1)).toBe(1);
    expect(smoothstep(0.5)).toBeCloseTo(0.5);
  });

  it("mapRange remaps with clamping", () => {
    expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
    expect(mapRange(20, 0, 10, 0, 100)).toBe(100);
  });

  it("loopFrame is deterministic for a progress value", () => {
    expect(loopFrame(0, 4, 1)).toBe(0);
    expect(loopFrame(0.25, 4, 1)).toBe(1);
  });
});
