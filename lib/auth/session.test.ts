import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { checkPassword, createSessionToken, verifySessionToken } from "./session";

describe("admin session", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_PASSWORD", "secret-password");
    vi.stubEnv("SESSION_SECRET", "test-session-secret-32-characters");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("validates the configured admin password", () => {
    expect(checkPassword("secret-password")).toBe(true);
    expect(checkPassword("wrong")).toBe(false);
  });

  it("creates and verifies a signed session token", () => {
    const token = createSessionToken();
    expect(verifySessionToken(token)).toBe(true);
    expect(verifySessionToken("invalid.token")).toBe(false);
  });
});
