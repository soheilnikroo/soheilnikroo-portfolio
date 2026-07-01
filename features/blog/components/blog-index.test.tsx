import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { PostMeta } from "@/lib/schemas";

import { BlogIndex } from "./blog-index";

const posts: PostMeta[] = [
  {
    title: "Motion matters",
    description: "Animating with care",
    date: "2026-05-01",
    category: "Motion",
    tags: ["motion"],
    draft: false,
    slug: "motion-matters",
    readingMinutes: 3,
  },
  {
    title: "Clean architecture",
    description: "Layers that earn their keep",
    date: "2026-04-01",
    category: "Architecture",
    tags: ["architecture"],
    draft: false,
    slug: "clean-architecture",
    readingMinutes: 4,
  },
];
describe("BlogIndex", () => {
  it("filters by search query", async () => {
    render(<BlogIndex posts={posts} categories={["Motion", "Architecture"]} />);
    expect(screen.getByText("Motion matters")).toBeInTheDocument();
    expect(screen.getByText("Clean architecture")).toBeInTheDocument();
    await userEvent.type(screen.getByRole("searchbox"), "motion");
    expect(screen.getByText("Motion matters")).toBeInTheDocument();
    expect(screen.queryByText("Clean architecture")).not.toBeInTheDocument();
  });
  it("filters by category", async () => {
    render(<BlogIndex posts={posts} categories={["Motion", "Architecture"]} />);
    await userEvent.click(screen.getByRole("button", { name: "Architecture" }));
    expect(screen.getByText("Clean architecture")).toBeInTheDocument();
    expect(screen.queryByText("Motion matters")).not.toBeInTheDocument();
  });
});
