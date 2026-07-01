import type { Metadata } from "next";

import { PostEditorLoader } from "@/features/admin/components/post-editor-loader";

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
  return <PostEditorLoader id={id} />;
}
