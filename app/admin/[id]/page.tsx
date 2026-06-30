import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { PostEditor } from "@/features/admin";
import { isAdmin } from "@/lib/auth/session";
import { getPostById } from "@/lib/data/posts";
import { toAdminPost } from "@/lib/data/posts-admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit post", robots: { index: false, follow: false } };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const row = await getPostById(id).catch(() => null);
  if (!row) notFound();
  return (
    <Container className="max-w-[var(--prose)] py-section">
      <PostEditor mode="edit" post={toAdminPost(row)} />
    </Container>
  );
}
