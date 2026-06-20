import { ProjectSchema } from "@/lib/schemas";
import type { Project } from "@/lib/schemas";

/**
 * Project repository. Returns validated, ordered projects. Real content is
 * populated in Step 6 (content & data layer); the contract is stable.
 */
const projects: Project[] = [];

function byDisplayOrder(a: Project, b: Project): number {
  if (a.order !== b.order) return a.order - b.order;
  return b.year - a.year;
}

export async function getProjects(): Promise<Project[]> {
  return [...projects].map((p) => ProjectSchema.parse(p)).sort(byDisplayOrder);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.featured);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const all = await getProjects();
  return all.find((p) => p.slug === slug) ?? null;
}
