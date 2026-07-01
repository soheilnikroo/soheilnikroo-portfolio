import type { Metadata } from "next";

import { ProjectsDashboard } from "@/features/admin/components/projects-dashboard";
import { listAllProjectRows } from "@/lib/data/projects";
import { toAdminProject } from "@/lib/data/projects-admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin — Projects",
  robots: { index: false, follow: false },
};
export default async function AdminProjectsPage() {
  let rows: Awaited<ReturnType<typeof listAllProjectRows>> = [];
  let dbError = false;
  try {
    rows = await listAllProjectRows();
  } catch {
    dbError = true;
  }
  return <ProjectsDashboard initialProjects={rows.map(toAdminProject)} dbError={dbError} />;
}
