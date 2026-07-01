import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectEditor } from "@/features/admin/components/project-editor";
import { getProjectRow } from "@/lib/data/projects";
import { toAdminProject } from "@/lib/data/projects-admin";

export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}): Promise<Metadata> {
  const { id } = await params;
  const row = await getProjectRow(id);
  return {
    title: row ? `Admin — ${row.data.title}` : "Admin — Project",
    robots: { index: false, follow: false },
  };
}
export default async function AdminEditProjectPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;
  const row = await getProjectRow(id);
  if (!row) notFound();
  return <ProjectEditor mode="edit" project={toAdminProject(row)} />;
}
