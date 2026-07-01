import { unstable_cache } from "next/cache";
import readingTime from "reading-time";

import { loadPostMetaFromDisk, loadPostSourceFromDisk } from "@/lib/data/posts-fallback";
import { CONTENT_CACHE_REVALIDATE_SECONDS, CONTENT_CACHE_TAG } from "@/lib/data/revalidate-content";
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
import { shouldUseContentStore } from "@/lib/db/request-context";
import { PUBLIC_READ, LIVE_READ } from "@/lib/db/resilience";
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
function rowsToMeta(rows: PostRow[]): PostMeta[] {
  return rows.flatMap((row) => {
    const meta = safeRowToMeta(row);
    return meta ? [meta] : [];
  });
}
async function readPublicPostMetaFromDb(): Promise<PostMeta[]> {
  if (!shouldUseContentStore()) return [];
  const rows = await listPostRows(false, PUBLIC_READ);
  return rowsToMeta(rows);
}
const getPublicPostMetaCached = unstable_cache(readPublicPostMetaFromDb, ["posts-meta-public"], {
  tags: [CONTENT_CACHE_TAG],
  revalidate: CONTENT_CACHE_REVALIDATE_SECONDS,
});
export async function getAllPostMeta(includeDrafts = false): Promise<PostMeta[]> {
  if (includeDrafts) {
    try {
      return rowsToMeta(await listPostRows(true, { force: true }));
    } catch (error) {
      logContentStoreError("blog", error);
      return [];
    }
  }
  try {
    const metas = await getPublicPostMetaCached();
    if (metas.length > 0) return metas;
  } catch (error) {
    logContentStoreError("blog", error);
  }
  return loadPostMetaFromDisk(false);
}
export async function getPostMetaBySlug(
  slug: string,
  includeDrafts = false,
): Promise<PostMeta | null> {
  if (!shouldUseContentStore()) {
    const fallback = await loadPostSourceFromDisk(slug, includeDrafts);
    return fallback?.meta ?? null;
  }
  try {
    const row = await getPostRowBySlug(slug);
    if (row) {
      if (!includeDrafts && !row.published) return null;
      return rowToMeta(row);
    }
  } catch (error) {
    logContentStoreError("blog", error);
    if (includeDrafts) return null;
  }
  const fallback = await loadPostSourceFromDisk(slug, includeDrafts);
  return fallback?.meta ?? null;
}
export async function getPostSource(
  slug: string,
  includeDrafts = false,
): Promise<PostSource | null> {
  if (!shouldUseContentStore()) return loadPostSourceFromDisk(slug, includeDrafts);
  try {
    const row = await getPostRowBySlug(slug);
    if (row) {
      if (!includeDrafts && !row.published) return null;
      return { meta: rowToMeta(row), content: row.body };
    }
  } catch (error) {
    logContentStoreError("blog", error);
    if (includeDrafts) return null;
  }
  return loadPostSourceFromDisk(slug, includeDrafts);
}
export async function getAllCategories(): Promise<string[]> {
  const posts = await getAllPostMeta();
  return [...new Set(posts.map((post) => post.category))].sort();
}
export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPostMeta();
  return [...new Set(posts.flatMap((post) => post.tags))].sort();
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
  return listPostRows(includeDrafts, LIVE_READ);
}
export async function getPostById(id: string): Promise<PostRow | null> {
  return getPostRowById(id, LIVE_READ);
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
