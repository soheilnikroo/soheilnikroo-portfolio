import type { Metadata } from "next";

import { ProjectsDashboard } from "@/features/admin/components/projects-dashboard";
import { listAllProjectRows } from "@/lib/data/projects";
import { toAdminProject } from "@/lib/data/projects-admin";
import { logContentStoreError } from "@/lib/db/log-content-store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin — Projects",
  robots: { index: false, follow: false },
};

export default async function AdminProjectsPage() {
  try {
    const rows = await listAllProjectRows();
    return <ProjectsDashboard initialProjects={rows.map(toAdminProject)} />;
  } catch (error) {
    logContentStoreError("projects", error);
    return <ProjectsDashboard initialProjects={[]} dbUnavailable />;
  }
}
