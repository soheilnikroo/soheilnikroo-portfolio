import type { Metadata } from "next";

import { PostEditor } from "@/features/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New post", robots: { index: false, follow: false } };

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-[var(--prose)]">
      <PostEditor mode="create" />
    </div>
  );
}
