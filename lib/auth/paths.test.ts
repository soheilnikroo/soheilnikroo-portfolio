import { describe, expect, it } from "vitest";

import { safeAdminRedirectPath } from "./paths";

describe("safeAdminRedirectPath", () => {
  it("allows admin panel paths", () => {
    expect(safeAdminRedirectPath("/admin/projects")).toBe("/admin/projects");
  });
  it("rejects login and external redirects", () => {
    expect(safeAdminRedirectPath("/admin/login")).toBe("/admin");
    expect(safeAdminRedirectPath("https://evil.test/admin")).toBe("/admin");
    expect(safeAdminRedirectPath(null)).toBe("/admin");
  });
});
