import { unstable_cache } from "next/cache";

import seedProjects from "@/content/seed/projects.json";
import { logContentStoreError } from "@/lib/db/log-content-store";
import {
  createProjectRow,
  deleteProjectRow,
  getProjectRowById,
  getProjectRowBySlug,
  listProjectRows,
  updateProjectRow,
} from "@/lib/db/projects-store";
import type { ProjectRow } from "@/lib/db/projects-store";
import { shouldUseContentStore } from "@/lib/db/request-context";
import { LIVE_READ, PUBLIC_READ } from "@/lib/db/resilience";
import { ProjectSchema } from "@/lib/schemas";
import type { Project } from "@/lib/schemas";

import { CONTENT_CACHE_REVALIDATE_SECONDS, CONTENT_CACHE_TAG } from "./revalidate-content";

const fallbackProjects: Project[] = seedProjects.map((project) =>
  ProjectSchema.parse({
    ...project,
    screenshots: project.screenshots ?? [],
  }),
);
function byDisplayOrder(a: Project, b: Project): number {
  if (a.order !== b.order) return a.order - b.order;
  return b.year - a.year;
}
function rowToProject(row: ProjectRow): Project {
  return ProjectSchema.parse(row.data);
}

async function readProjectsFromDb(): Promise<Project[]> {
  if (!shouldUseContentStore()) return [];
  const rows = await listProjectRows(PUBLIC_READ);
  if (rows.length === 0) return [];
  return rows.map(rowToProject).sort(byDisplayOrder);
}
const getProjectsCached = unstable_cache(readProjectsFromDb, ["projects-public"], {
  tags: [CONTENT_CACHE_TAG],
  revalidate: CONTENT_CACHE_REVALIDATE_SECONDS,
});
export async function getProjects(): Promise<Project[]> {
  try {
    const projects = await getProjectsCached();
    if (projects.length === 0) return [...fallbackProjects].sort(byDisplayOrder);
    return projects;
  } catch (error) {
    logContentStoreError("projects", error);
    return [...fallbackProjects].sort(byDisplayOrder);
  }
}
export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.featured);
}
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!shouldUseContentStore()) {
    return fallbackProjects.find((p) => p.slug === slug) ?? null;
  }
  try {
    const row = await getProjectRowBySlug(slug);
    if (row) return rowToProject(row);
    return fallbackProjects.find((p) => p.slug === slug) ?? null;
  } catch (error) {
    logContentStoreError("projects", error);
    return fallbackProjects.find((p) => p.slug === slug) ?? null;
  }
}
export async function listAllProjectRows(): Promise<ProjectRow[]> {
  return listProjectRows(LIVE_READ);
}
export async function getProjectRow(id: string): Promise<ProjectRow | null> {
  return getProjectRowById(id, LIVE_READ);
}
export async function createProject(data: Project): Promise<ProjectRow> {
  return createProjectRow(data.slug, data);
}
export async function updateProject(id: string, data: Project): Promise<ProjectRow | null> {
  return updateProjectRow(id, data.slug, data);
}
export async function deleteProject(id: string): Promise<boolean> {
  return deleteProjectRow(id);
}
export { fallbackProjects };
