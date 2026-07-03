import { describe, expect, it } from "vitest";

import { resolveTech } from "./tech-registry";

describe("resolveTech", () => {
  it("maps known stack entries with icons", () => {
    expect(resolveTech("React").icon).toBe("react");
    expect(resolveTech("TypeScript").color).toBe("#3178C6");
  });

  it("uses glyphs instead of long abbreviations for soft skills", () => {
    const communication = resolveTech("Communication");
    expect(communication.glyph).toBe("message");
    expect(communication.abbr).toBeUndefined();
  });

  it("falls back to a short abbreviation for unknown tech", () => {
    expect(resolveTech("Some New Tool").abbr).toBe("SO");
  });
});
