import type { Metadata } from "next";

import { ProjectEditorLoader } from "@/features/admin/components/project-editor-loader";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin — Project",
  robots: { index: false, follow: false },
};
export default async function AdminEditProjectPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;
  return <ProjectEditorLoader id={id} />;
}
