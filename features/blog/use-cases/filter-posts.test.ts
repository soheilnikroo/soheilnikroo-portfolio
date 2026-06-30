import { describe, expect, it } from "vitest";

import type { PostMeta } from "@/lib/schemas";

import { filterPosts } from "./filter-posts";

const posts: PostMeta[] = [
  {
    slug: "alpha",
    title: "Alpha Post",
    description: "First description",
    date: "2025-01-01",
    category: "Engineering",
    tags: ["react"],
    readingMinutes: 3,
    draft: false,
  },
  {
    slug: "beta",
    title: "Beta Notes",
    description: "Motion design",
    date: "2025-02-01",
    category: "Design",
    tags: ["motion"],
    readingMinutes: 5,
    draft: false,
  },
];

describe("filterPosts", () => {
  it("returns all posts when query and category are empty", () => {
    expect(filterPosts(posts, "", null)).toHaveLength(2);
  });

  it("filters by category", () => {
    expect(filterPosts(posts, "", "Design")).toEqual([posts[1]]);
  });

  it("filters by title, description, and tags", () => {
    expect(filterPosts(posts, "motion", null)).toEqual([posts[1]]);
    expect(filterPosts(posts, "alpha", null)).toEqual([posts[0]]);
  });
});
