import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { adminAuthConfigError, isAdminAuthConfigured } from "./config";
import { checkPassword, createSessionToken, verifySessionToken } from "./session";

describe("admin auth config", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_PASSWORD", "secret-password");
    vi.stubEnv("SESSION_SECRET", "test-session-secret-32-characters");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });
  it("reports configured auth when secrets meet minimum length", () => {
    expect(isAdminAuthConfigured()).toBe(true);
    expect(adminAuthConfigError()).toBeNull();
  });
  it("rejects weak session secret", () => {
    vi.stubEnv("SESSION_SECRET", "short");
    expect(isAdminAuthConfigured()).toBe(false);
    expect(adminAuthConfigError()).toMatch(/SESSION_SECRET/);
  });
});

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
  it("invalidates tokens when credentials rotate", () => {
    const token = createSessionToken();
    vi.stubEnv("ADMIN_PASSWORD", "new-secret-password");
    expect(verifySessionToken(token)).toBe(false);
  });
});
