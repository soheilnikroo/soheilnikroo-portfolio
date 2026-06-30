import { describe, expect, it } from "vitest";

import { getWorldPageProps } from "./get-world-props";

describe("getWorldPageProps", () => {
  it("aggregates profile, projects, skills, and posts", async () => {
    const props = await getWorldPageProps();
    expect(props.profileName).toBe("Soheil Nikroo");
    expect(props.projects.length).toBeGreaterThan(0);
    expect(props.skills.length).toBeGreaterThan(0);
    expect(props.milestones.length).toBe(4);
    expect(props.email.length).toBeGreaterThan(0);
  });
});
