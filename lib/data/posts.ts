import type { PostMeta } from "@/lib/schemas";

/**
 * Post repository contract. Step 12 wires this to read content/blog/*.mdx via
 * gray-matter and compute reading time; for now it returns an empty, typed set.
 */
export async function getAllPostMeta(includeDrafts = false): Promise<PostMeta[]> {
  const posts: PostMeta[] = [];
  const visible = includeDrafts ? posts : posts.filter((p) => !p.draft);
  return visible.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostMetaBySlug(slug: string): Promise<PostMeta | null> {
  const all = await getAllPostMeta(true);
  return all.find((p) => p.slug === slug) ?? null;
}
