import { describe, expect, it } from "vitest";

import { cssVar, durations, durationsMs, easing, easings, tokens, zIndex } from "./tokens";

describe("design tokens", () => {
  it("durations mirror ms in seconds", () => {
    expect(durationsMs.base).toBe(320);
    expect(durations.base).toBeCloseTo(0.32);
  });
  it("easings are 4-point cubic-beziers", () => {
    expect(easings.standard).toHaveLength(4);
    expect(easing("spring")).toEqual([0.34, 1.56, 0.64, 1]);
    // returns a mutable copy, not the frozen tuple
    expect(easing("standard")).not.toBe(easings.standard);
  });
  it("cssVar builds custom-property references", () => {
    expect(cssVar.duration("base")).toBe("var(--duration-base)");
    expect(cssVar.ease("spring")).toBe("var(--ease-spring)");
    expect(cssVar.z("nav")).toBe("var(--z-nav)");
  });
  it("z-index layers are ordered", () => {
    expect(zIndex.nav).toBe(200);
    expect(zIndex.tooltip).toBeGreaterThan(zIndex.modal);
  });
  it("named tokens export aggregates values", () => {
    expect(Object.keys(tokens)).toContain("durations");
  });
});
