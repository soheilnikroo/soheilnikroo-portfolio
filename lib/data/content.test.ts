import { describe, expect, it } from "vitest";

import { getFeaturedProjects, getProfile, getProjects, getSkillGraph } from "./index";
import { rowToMeta } from "./posts";

describe("data layer", () => {
  it("profile is valid", async () => {
    const p = await getProfile();
    expect(p.name).toBe("Soheil Nikroo");
    expect(p.socials.length).toBeGreaterThan(0);
  });
  it("projects parse, sort, and include featured", async () => {
    const all = await getProjects();
    expect(all.length).toBe(6);
    expect(all[0]!.order).toBeLessThanOrEqual(all[1]!.order);
    expect((await getFeaturedProjects()).every((p) => p.featured)).toBe(true);
  });
  it("rowToMeta maps a DB row to validated post metadata", () => {
    const meta = rowToMeta({
      id: "1",
      slug: "hello-world",
      title: "Hello",
      description: "A description",
      category: "Engineering",
      tags: ["a", "b"],
      body: "# Heading\n\n".concat("word ".repeat(400)),
      cover: null,
      published: true,
      date: new Date("2025-01-02T00:00:00Z"),
      created_at: new Date(),
      updated_at: new Date(),
    });
    expect(meta.slug).toBe("hello-world");
    expect(meta.draft).toBe(false);
    expect(meta.date).toBe("2025-01-02");
    expect(meta.tags).toEqual(["a", "b"]);
    expect(meta.readingMinutes).toBeGreaterThanOrEqual(1);
  });
  it("skill graph edges reference real nodes", async () => {
    const g = await getSkillGraph();
    const ids = new Set(g.nodes.map((n) => n.id));
    expect(g.edges.every((e) => ids.has(e.source) && ids.has(e.target))).toBe(true);
  });
});
