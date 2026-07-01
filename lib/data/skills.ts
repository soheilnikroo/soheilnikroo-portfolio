import { logContentStoreError } from "@/lib/db/log-content-store";
import { getSiteContentRow, upsertSiteContentRow } from "@/lib/db/site-content-store";
import { SkillGraphSchema } from "@/lib/schemas";
import type { SkillGraph } from "@/lib/schemas";

const fallbackGraph: SkillGraph = SkillGraphSchema.parse({
  nodes: [
    {
      id: "typescript",
      label: "TypeScript",
      category: "language",
      level: 5,
      summary: "Strict typing, large-codebase maintainability at Snapp.",
    },
    {
      id: "react",
      label: "React",
      category: "framework",
      level: 5,
      summary: "Production UI at scale — hooks, patterns, performance.",
    },
    {
      id: "nextjs",
      label: "Next.js",
      category: "framework",
      level: 5,
      summary: "App Router, SSR/SSG, production Next in consumer apps.",
    },
    {
      id: "architecture",
      label: "Architecture",
      category: "practice",
      level: 5,
      summary: "Design patterns, layering, pragmatic boundaries.",
    },
    {
      id: "pwa",
      label: "PWA",
      category: "platform",
      level: 5,
      summary: "Production PWAs — offline, installable, mobile-first.",
    },
    {
      id: "redux-toolkit",
      label: "Redux Toolkit",
      category: "framework",
      level: 4,
      summary: "Global state at scale on high-traffic products.",
    },
    {
      id: "swr",
      label: "SWR",
      category: "framework",
      level: 4,
      summary: "Data fetching, cache, UX under load.",
    },
    {
      id: "design-systems",
      label: "UI Kit / Design Systems",
      category: "design",
      level: 4,
      summary: "Shared components, consistency across teams.",
    },
    {
      id: "performance",
      label: "Performance",
      category: "practice",
      level: 4,
      summary: "Bundle, runtime, perceived speed for millions of users.",
    },
    {
      id: "testing",
      label: "Testing",
      category: "practice",
      level: 4,
      summary: "Confidence before ship — unit, integration, a11y.",
    },
    {
      id: "accessibility",
      label: "Accessibility",
      category: "practice",
      level: 4,
      summary: "WCAG, keyboard, inclusive defaults.",
    },
    {
      id: "tailwind",
      label: "Tailwind / SCSS",
      category: "design",
      level: 4,
      summary: "Utility + preprocessor craft at scale.",
    },
    {
      id: "ci-cd",
      label: "CI/CD",
      category: "tooling",
      level: 4,
      summary: "Docker, pipelines, ESLint — ship safely.",
    },
    {
      id: "swift",
      label: "Swift",
      category: "language",
      level: 2,
      summary: "Learning — native mobile ambition.",
    },
    {
      id: "swiftui",
      label: "SwiftUI",
      category: "framework",
      level: 2,
      summary: "Learning — building toward iOS.",
    },
    {
      id: "rust",
      label: "Rust",
      category: "language",
      level: 2,
      summary: "Early — systems thinking curiosity.",
    },
  ],
  edges: [
    { source: "typescript", target: "react", strength: 0.95 },
    { source: "react", target: "nextjs", strength: 0.95 },
    { source: "architecture", target: "typescript", strength: 0.85 },
    { source: "architecture", target: "nextjs", strength: 0.8 },
    { source: "react", target: "redux-toolkit", strength: 0.85 },
    { source: "react", target: "swr", strength: 0.8 },
    { source: "design-systems", target: "tailwind", strength: 0.85 },
    { source: "pwa", target: "performance", strength: 0.9 },
    { source: "react", target: "testing", strength: 0.75 },
    { source: "react", target: "accessibility", strength: 0.75 },
    { source: "ci-cd", target: "testing", strength: 0.6 },
    { source: "swift", target: "swiftui", strength: 0.9 },
  ],
});
export async function getSkillGraph(): Promise<SkillGraph> {
  try {
    const row = await getSiteContentRow("skills");
    if (!row) return fallbackGraph;
    return SkillGraphSchema.parse(row.data);
  } catch (error) {
    logContentStoreError("skills", error);
    return fallbackGraph;
  }
}
export async function saveSkillGraph(data: SkillGraph): Promise<void> {
  const parsed = SkillGraphSchema.parse(data);
  await upsertSiteContentRow("skills", parsed);
}
export { fallbackGraph };
