import type { AdminPost } from "@/features/admin/components/types";
import type { PostRow } from "@/lib/db/posts-store";

export function toAdminPost(row: PostRow): AdminPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    tags: row.tags,
    body: row.body,
    cover: row.cover,
    published: row.published,
    date: new Date(row.date).toISOString().slice(0, 10),
  };
}
