import { ProjectSchema } from "@/lib/schemas";
import type { Project } from "@/lib/schemas";

/**
 * Project content. Each project is an immersive "destination" telling the
 * problem → challenge → process → solution → outcome story. Realistic
 * placeholders — edit freely. Covers are intentionally omitted (gradient
 * fallback in the UI); drop images under /public and set `cover` to enable.
 */
const projects: Project[] = [
  {
    slug: "vport-platform",
    title: "VPORT Platform",
    summary:
      "A product platform unifying fragmented internal tools into one fast, cohesive workspace.",
    year: 2025,
    role: "Lead Front-end Engineer",
    status: "live",
    tags: ["Product", "Platform", "Design System"],
    tech: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL", "tRPC"],
    links: { live: "https://www.thevport.com" },
    accent: "#6366f1",
    featured: true,
    order: 1,
    narrative: {
      problem:
        "Teams juggled five disconnected tools to ship a single workflow, losing context at every hand-off.",
      challenge:
        "Unify them without a big-bang rewrite, while keeping each team productive throughout the migration.",
      process:
        "Mapped the shared domain, extracted a design-system core, then migrated surface-by-surface behind feature flags.",
      solution:
        "A single workspace with a shared component library, consistent navigation, and a typed data layer.",
      outcome:
        "Cut task-switching time substantially and gave the team one place to build — and one system to maintain.",
    },
  },
  {
    slug: "aurora-design-system",
    title: "Aurora Design System",
    summary:
      "A token-driven design system and component library powering multiple products from one source of truth.",
    year: 2024,
    role: "Design Systems Engineer",
    status: "live",
    tags: ["Design System", "Accessibility", "Tokens"],
    tech: ["React", "TypeScript", "Tailwind", "Radix", "Storybook"],
    links: { repo: "https://github.com/soheilnikroo" },
    accent: "#22d3ee",
    featured: true,
    order: 2,
    narrative: {
      problem:
        "Every product reinvented buttons, inputs, and color — inconsistent UX and duplicated effort everywhere.",
      challenge:
        "Build a system flexible enough for three products yet strict enough to stay coherent and accessible.",
      process:
        "Defined semantic tokens, built accessible primitives on Radix, and documented usage with live examples.",
      solution:
        "A themeable, WCAG-audited library consumed by every product, with tokens as the single source of truth.",
      outcome:
        "New screens ship faster, dark mode came essentially for free, and accessibility regressions dropped sharply.",
    },
  },
  {
    slug: "pulse-analytics",
    title: "Pulse Analytics",
    summary:
      "A real-time analytics dashboard turning noisy event streams into calm, legible insight.",
    year: 2024,
    role: "Front-end Engineer",
    status: "live",
    tags: ["Data Viz", "Performance", "Real-time"],
    tech: ["Next.js", "TypeScript", "D3", "WebSockets"],
    links: {},
    accent: "#f59e0b",
    featured: false,
    order: 3,
    narrative: {
      problem:
        "Stakeholders drowned in dashboards that were dense, slow, and hard to trust during live incidents.",
      challenge:
        "Render high-frequency data smoothly while keeping the interface readable and accessible.",
      process:
        "Profiled render hotspots, virtualized heavy lists, and designed charts around progressive disclosure.",
      solution:
        "A streaming dashboard with smooth 60fps updates, keyboard-navigable charts, and sensible defaults.",
      outcome:
        "Faster time-to-insight during incidents and a dashboard people actually keep open all day.",
    },
  },
  {
    slug: "fieldnotes-cms",
    title: "Fieldnotes CMS",
    summary:
      "A lightweight, MDX-powered publishing experience for writers who want speed without a heavy CMS.",
    year: 2023,
    role: "Full-stack Engineer",
    status: "archived",
    tags: ["Content", "MDX", "DX"],
    tech: ["Next.js", "MDX", "TypeScript", "Zod"],
    links: { repo: "https://github.com/soheilnikroo" },
    accent: "#ec4899",
    featured: false,
    order: 4,
    narrative: {
      problem:
        "Writers wanted rich, componentized posts but hated wrestling with a bloated traditional CMS.",
      challenge:
        "Offer component-in-prose authoring with strong validation, while keeping the stack tiny.",
      process:
        "Built an MDX pipeline with typed frontmatter, schema validation, and instant local previews.",
      solution:
        "A file-based publishing flow where posts are MDX, validated by Zod, and rendered as fast static pages.",
      outcome:
        "Writers shipped posts in minutes, and broken frontmatter failed loudly at build instead of in production.",
    },
  },
];

function byDisplayOrder(a: Project, b: Project): number {
  if (a.order !== b.order) return a.order - b.order;
  return b.year - a.year;
}

export async function getProjects(): Promise<Project[]> {
  return projects.map((p) => ProjectSchema.parse(p)).sort(byDisplayOrder);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.featured);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const all = await getProjects();
  return all.find((p) => p.slug === slug) ?? null;
}
