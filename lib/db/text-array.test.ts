import { describe, expect, it } from "vitest";

import { normalizeTextArray, pgTextArrayLiteral } from "./text-array";

describe("normalizeTextArray", () => {
  it("passes through arrays", () => {
    expect(normalizeTextArray(["a", "b"])).toEqual(["a", "b"]);
  });

  it("parses quoted postgres array literals", () => {
    expect(normalizeTextArray('{"architecture","typescript","next.js"}')).toEqual([
      "architecture",
      "typescript",
      "next.js",
    ]);
  });

  it("parses legacy comma-separated strings", () => {
    expect(normalizeTextArray("architecture,typescript,next.js")).toEqual([
      "architecture",
      "typescript",
      "next.js",
    ]);
  });
});

describe("pgTextArrayLiteral", () => {
  it("round-trips through normalizeTextArray", () => {
    const tags = ["architecture", "typescript", "next.js"];
    expect(normalizeTextArray(pgTextArrayLiteral(tags))).toEqual(tags);
  });
});
