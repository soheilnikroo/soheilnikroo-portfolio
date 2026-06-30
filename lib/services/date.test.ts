import { describe, expect, it } from "vitest";

import { formatDate } from "./date";

describe("formatDate", () => {
  it("formats ISO dates deterministically (UTC)", () => {
    expect(formatDate("2026-05-18")).toBe("May 18, 2026");
    expect(formatDate("2026-01-01")).toBe("January 1, 2026");
  });
});
