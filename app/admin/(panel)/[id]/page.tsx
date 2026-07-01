import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostEditor } from "@/features/admin";
import { getPostById } from "@/lib/data/posts";
import { toAdminPost } from "@/lib/data/posts-admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit post", robots: { index: false, follow: false } };
export default async function EditPostPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;
  const row = await getPostById(id).catch(() => null);
  if (!row) notFound();
  return (
    <div className="mx-auto max-w-[var(--prose)]">
      <PostEditor mode="edit" post={toAdminPost(row)} />
    </div>
  );
}
