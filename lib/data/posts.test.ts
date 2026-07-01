import { describe, expect, it, vi } from "vitest";

import { createPost, deletePost, getPostById, listAllPostRows, updatePost } from "./posts";

vi.mock("@/lib/db/posts-store", () => ({
  listPostRows: vi.fn(),
  getPostRowById: vi.fn(),
  createPostRow: vi.fn(),
  updatePostRow: vi.fn(),
  deletePostRow: vi.fn(),
}));
import {
  createPostRow,
  deletePostRow,
  getPostRowById,
  listPostRows,
  updatePostRow,
} from "@/lib/db/posts-store";

const sampleRow = {
  id: "1",
  slug: "hello",
  title: "Hello",
  description: "Desc",
  category: "Engineering",
  tags: ["a"],
  body: "# Hi",
  cover: null,
  published: true,
  date: new Date("2025-01-01T00:00:00Z"),
  created_at: new Date(),
  updated_at: new Date(),
};
const input = {
  slug: "hello",
  title: "Hello",
  description: "Desc",
  category: "Engineering",
  tags: ["a"],
  body: "# Hi",
  cover: null,
  published: true,
  date: "2025-01-01",
};
describe("posts repository", () => {
  it("lists rows through the repository", async () => {
    vi.mocked(listPostRows).mockResolvedValue([sampleRow]);
    await expect(listAllPostRows(true)).resolves.toEqual([sampleRow]);
  });
  it("creates posts through the repository", async () => {
    vi.mocked(createPostRow).mockResolvedValue(sampleRow);
    await expect(createPost(input)).resolves.toEqual(sampleRow);
  });
  it("updates and deletes posts through the repository", async () => {
    vi.mocked(getPostRowById).mockResolvedValue(sampleRow);
    vi.mocked(updatePostRow).mockResolvedValue(sampleRow);
    vi.mocked(deletePostRow).mockResolvedValue(true);
    await expect(getPostById("1")).resolves.toEqual(sampleRow);
    await expect(updatePost("1", input)).resolves.toEqual(sampleRow);
    await expect(deletePost("1")).resolves.toBe(true);
  });
});
