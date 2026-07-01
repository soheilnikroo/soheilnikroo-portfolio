import { describe, expect, it } from "vitest";

import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  it("blocks after the configured number of attempts", () => {
    const key = `test-${Date.now()}`;
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
    const blocked = checkRateLimit(key, 2, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
});
