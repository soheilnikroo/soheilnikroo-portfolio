import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminDbUnavailable } from "@/features/admin/components/admin-db-unavailable";
import { ProjectEditor } from "@/features/admin/components/project-editor";
import { getProjectRow } from "@/lib/data/projects";
import { toAdminProject } from "@/lib/data/projects-admin";
import { logContentStoreError } from "@/lib/db/log-content-store";

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

  try {
    const row = await getProjectRow(id);
    if (!row) notFound();

    return <ProjectEditor mode="edit" project={toAdminProject(row)} />;
  } catch (error) {
    logContentStoreError("projects", error);
    return <AdminDbUnavailable />;
  }
}
