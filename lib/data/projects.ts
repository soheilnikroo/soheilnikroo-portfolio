import {
  createProjectRow,
  deleteProjectRow,
  getProjectRowById,
  getProjectRowBySlug,
  listProjectRows,
  updateProjectRow,
} from "@/lib/db/projects-store";
import type { ProjectRow } from "@/lib/db/projects-store";
import { ProjectSchema } from "@/lib/schemas";
import type { Project } from "@/lib/schemas";

const fallbackProjects: Project[] = [
  {
    slug: "snapp",
    title: "Snapp",
    summary:
      "High-scale React/Next.js/TypeScript product — PWAs, UI kit, Redux Toolkit, SWR, and mobile-first delivery for millions of users in Tehran.",
    year: 2025,
    role: "Frontend Engineer",
    status: "live",
    tags: ["Scale", "PWA", "React"],
    tech: ["React", "Next.js", "TypeScript", "Redux Toolkit", "SWR", "PWA"],
    links: { live: "https://snapp.ir" },
    accent: "#22c55e",
    featured: true,
    order: 1,
    screenshots: [],
    narrative: {
      problem:
        "A consumer super-app serving millions needed fast, reliable frontends across devices and network conditions.",
      challenge:
        "Ship features at scale without sacrificing performance, accessibility, or maintainability across teams.",
      process:
        "Built on a shared UI kit, Redux Toolkit for state, SWR for data — with CI/CD, ESLint, and mobile-first patterns.",
      solution:
        "Production PWAs and responsive web apps with strong TypeScript boundaries and cross-browser quality.",
      outcome:
        "Millions of users rely on the experience daily — performance and reliability are non-negotiable.",
    },
  },
  {
    slug: "jaan",
    title: "Jaan",
    summary:
      "First production frontend role — React, Agile delivery, and shipping real features to real users.",
    year: 2022,
    role: "Frontend Developer",
    status: "archived",
    tags: ["React", "Agile", "Production"],
    tech: ["React", "JavaScript", "SCSS", "Jest"],
    links: {},
    accent: "#6366f1",
    featured: true,
    order: 2,
    screenshots: [],
    narrative: {
      problem: "A growing product needed a dedicated frontend engineer to ship UI reliably.",
      challenge: "Learn production patterns fast while delivering under Agile sprints.",
      process: "React components, code review, JIRA workflows, and iterative releases.",
      solution: "Shipped production features with attention to UX and cross-browser basics.",
      outcome: "Built the foundation for everything that came after at Snapp.",
    },
  },
  {
    slug: "ilia",
    title: "ILIA Corporation",
    summary: "First industry internship — learning how teams work, communicate, and deliver.",
    year: 2020,
    role: "Intern",
    status: "archived",
    tags: ["Internship", "Teams"],
    tech: ["JIRA", "Communication"],
    links: {},
    accent: "#f59e0b",
    featured: false,
    order: 3,
    screenshots: [],
    narrative: {
      problem: "I needed real workplace experience alongside university.",
      challenge: "Translate classroom knowledge into professional collaboration.",
      process: "Task management, written communication, and team workflows.",
      solution: "Showed up, learned, and contributed where I could.",
      outcome: "The first step from student to engineer.",
    },
  },
];

function byDisplayOrder(a: Project, b: Project): number {
  if (a.order !== b.order) return a.order - b.order;
  return b.year - a.year;
}

function rowToProject(row: ProjectRow): Project {
  return ProjectSchema.parse(row.data);
}

function warnDb(error: unknown): void {
  console.warn(
    "[projects] database unavailable — using bundled fallback. Set DATABASE_URL and run `pnpm db:seed`.",
    error instanceof Error ? error.message : error,
  );
}

export async function getProjects(): Promise<Project[]> {
  try {
    const rows = await listProjectRows();
    if (rows.length === 0) return [...fallbackProjects].sort(byDisplayOrder);
    return rows.map(rowToProject).sort(byDisplayOrder);
  } catch (error) {
    warnDb(error);
    return [...fallbackProjects].sort(byDisplayOrder);
  }
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.featured);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const row = await getProjectRowBySlug(slug);
    if (row) return rowToProject(row);
    return fallbackProjects.find((p) => p.slug === slug) ?? null;
  } catch (error) {
    warnDb(error);
    return fallbackProjects.find((p) => p.slug === slug) ?? null;
  }
}

export async function listAllProjectRows(): Promise<ProjectRow[]> {
  return listProjectRows({ force: true });
}

export async function getProjectRow(id: string): Promise<ProjectRow | null> {
  return getProjectRowById(id, { force: true });
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
