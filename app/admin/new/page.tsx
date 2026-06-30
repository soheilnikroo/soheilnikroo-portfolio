import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { PostEditor } from "@/features/admin";
import { isAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New post", robots: { index: false, follow: false } };

export default async function NewPostPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <Container className="max-w-[var(--prose)] py-section">
      <PostEditor mode="create" />
    </Container>
  );
}
