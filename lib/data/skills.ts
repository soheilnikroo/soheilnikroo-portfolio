import { SkillGraphSchema } from "@/lib/schemas";
import type { SkillGraph } from "@/lib/schemas";

/**
 * Skills as a relationship graph (constellation), not progress bars. `level`
 * drives node prominence; `edges` express how skills are used together.
 */
const graph: SkillGraph = SkillGraphSchema.parse({
  nodes: [
    { id: "typescript", label: "TypeScript", category: "language", level: 5, summary: "Typed end-to-end, strict by default." },
    { id: "react", label: "React", category: "framework", level: 5, summary: "Server & client components, hooks, Suspense." },
    { id: "nextjs", label: "Next.js", category: "framework", level: 5, summary: "App Router, RSC, streaming, edge." },
    { id: "tailwind", label: "Tailwind CSS", category: "design", level: 5, summary: "Token-driven, design-system friendly." },
    { id: "motion", label: "Motion", category: "framework", level: 4, summary: "Scroll-driven & physics-based animation." },
    { id: "node", label: "Node.js", category: "platform", level: 4, summary: "APIs, tooling, server actions." },
    { id: "design-systems", label: "Design Systems", category: "design", level: 4, summary: "Tokens, primitives, documentation." },
    { id: "accessibility", label: "Accessibility", category: "practice", level: 4, summary: "WCAG, keyboard, reduced-motion." },
    { id: "testing", label: "Testing", category: "practice", level: 4, summary: "Vitest, RTL, Playwright, axe." },
    { id: "architecture", label: "Architecture", category: "practice", level: 4, summary: "Clean layering, pragmatic boundaries." },
    { id: "postgres", label: "PostgreSQL", category: "platform", level: 3, summary: "Modeling, queries, migrations." },
    { id: "figma", label: "Figma", category: "design", level: 3, summary: "Design hand-off & prototyping." },
  ],
  edges: [
    { source: "typescript", target: "react", strength: 0.9 },
    { source: "react", target: "nextjs", strength: 0.95 },
    { source: "nextjs", target: "node", strength: 0.7 },
    { source: "react", target: "motion", strength: 0.8 },
    { source: "tailwind", target: "design-systems", strength: 0.85 },
    { source: "design-systems", target: "figma", strength: 0.6 },
    { source: "react", target: "accessibility", strength: 0.7 },
    { source: "motion", target: "accessibility", strength: 0.6 },
    { source: "react", target: "testing", strength: 0.7 },
    { source: "architecture", target: "typescript", strength: 0.6 },
    { source: "architecture", target: "nextjs", strength: 0.6 },
    { source: "node", target: "postgres", strength: 0.6 },
    { source: "tailwind", target: "nextjs", strength: 0.7 },
  ],
});

export function getSkillGraph(): Promise<SkillGraph> {
  return Promise.resolve(graph);
}
