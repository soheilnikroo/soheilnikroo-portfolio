import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostEditor } from "@/features/admin";
import { AdminDbUnavailable } from "@/features/admin/components/admin-db-unavailable";
import { getPostById } from "@/lib/data/posts";
import { toAdminPost } from "@/lib/data/posts-admin";
import { logContentStoreError } from "@/lib/db/log-content-store";

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

  try {
    const row = await getPostById(id);
    if (!row) notFound();

    return (
      <div className="mx-auto max-w-[var(--prose)]">
        <PostEditor mode="edit" post={toAdminPost(row)} />
      </div>
    );
  } catch (error) {
    logContentStoreError("blog", error);
    return (
      <div className="mx-auto max-w-[var(--prose)]">
        <AdminDbUnavailable />
      </div>
    );
  }
}
