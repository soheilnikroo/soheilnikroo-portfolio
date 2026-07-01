import readingTime from "reading-time";

import { logContentStoreError } from "@/lib/db/log-content-store";
import {
  createPostRow,
  deletePostRow,
  getPostRowById,
  getPostRowBySlug,
  listPostRows,
  updatePostRow,
} from "@/lib/db/posts-store";
import type { PostInput, PostRow } from "@/lib/db/posts-store";
import { PostMetaSchema } from "@/lib/schemas";
import type { PostInputValues, PostMeta } from "@/lib/schemas";

export type PostSource = {
  meta: PostMeta;
  content: string;
};
function toIsoDate(value: Date): string {
  return new Date(value).toISOString().slice(0, 10);
}
export function rowToMeta(row: PostRow): PostMeta {
  const stats = readingTime(row.body);
  return PostMetaSchema.parse({
    title: row.title,
    description: row.description,
    date: toIsoDate(row.date),
    category: row.category,
    tags: row.tags,
    cover: row.cover ?? undefined,
    draft: !row.published,
    slug: row.slug,
    readingMinutes: Math.max(1, Math.round(stats.minutes)),
  });
}
function safeRowToMeta(row: PostRow): PostMeta | null {
  try {
    return rowToMeta(row);
  } catch (error) {
    logContentStoreError(`blog/${row.slug}`, error);
    return null;
  }
}
export async function getAllPostMeta(includeDrafts = false): Promise<PostMeta[]> {
  try {
    const rows = await listPostRows(includeDrafts);
    return rows.flatMap((row) => {
      const meta = safeRowToMeta(row);
      return meta ? [meta] : [];
    });
  } catch (error) {
    logContentStoreError("blog", error);
    return [];
  }
}
export async function getPostMetaBySlug(
  slug: string,
  includeDrafts = false,
): Promise<PostMeta | null> {
  try {
    const row = await getPostRowBySlug(slug);
    if (!row) return null;
    if (!includeDrafts && !row.published) return null;
    return rowToMeta(row);
  } catch (error) {
    logContentStoreError("blog", error);
    return null;
  }
}
export async function getPostSource(
  slug: string,
  includeDrafts = false,
): Promise<PostSource | null> {
  try {
    const row = await getPostRowBySlug(slug);
    if (!row) return null;
    if (!includeDrafts && !row.published) return null;
    return { meta: rowToMeta(row), content: row.body };
  } catch (error) {
    logContentStoreError("blog", error);
    return null;
  }
}
export async function getAllCategories(): Promise<string[]> {
  try {
    const rows = await listPostRows(false);
    return [...new Set(rows.map((r) => r.category))].sort();
  } catch (error) {
    logContentStoreError("blog", error);
    return [];
  }
}
export async function getAllTags(): Promise<string[]> {
  try {
    const rows = await listPostRows(false);
    return [...new Set(rows.flatMap((r) => r.tags))].sort();
  } catch (error) {
    logContentStoreError("blog", error);
    return [];
  }
}
function toDbInput(input: PostInputValues): PostInput {
  return {
    slug: input.slug,
    title: input.title,
    description: input.description,
    category: input.category,
    tags: input.tags,
    body: input.body,
    cover: input.cover ?? null,
    published: input.published,
    date: new Date(input.date),
  };
}
export async function listAllPostRows(includeDrafts = false): Promise<PostRow[]> {
  return listPostRows(includeDrafts);
}
export async function getPostById(id: string): Promise<PostRow | null> {
  return getPostRowById(id);
}
export async function createPost(input: PostInputValues): Promise<PostRow> {
  return createPostRow(toDbInput(input));
}
export async function updatePost(id: string, input: PostInputValues): Promise<PostRow | null> {
  return updatePostRow(id, toDbInput(input));
}
export async function deletePost(id: string): Promise<boolean> {
  return deletePostRow(id);
}
