import type { PostMeta } from "@/lib/schemas";

export function filterPosts(
  posts: readonly PostMeta[],
  query: string,
  category: string | null,
): PostMeta[] {
  const q = query.trim().toLowerCase();
  return posts.filter((post) => {
    if (category && post.category !== category) return false;
    if (!q) return true;
    return (
      post.title.toLowerCase().includes(q) ||
      post.description.toLowerCase().includes(q) ||
      post.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });
}
