import type { AdminProject } from "@/features/admin/components/types";
import type { ProjectRow } from "@/lib/db/projects-store";

export function toAdminProject(row: ProjectRow): AdminProject {
  return { id: row.id, slug: row.slug, data: row.data };
}
