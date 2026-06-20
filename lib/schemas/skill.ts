import { z } from "zod";

export const SkillCategorySchema = z.enum([
  "language",
  "framework",
  "tooling",
  "design",
  "practice",
  "platform",
]);

export type SkillCategory = z.infer<typeof SkillCategorySchema>;

export const SkillNodeSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id must be kebab-case"),
  label: z.string().min(1),
  category: SkillCategorySchema,
  /** Proficiency, 1 (familiar) .. 5 (expert) — drives node size, not a progress bar. */
  level: z.number().int().min(1).max(5),
  summary: z.string().optional(),
});

export type SkillNode = z.infer<typeof SkillNodeSchema>;

export const SkillEdgeSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  strength: z.number().min(0).max(1).default(0.5),
});

export type SkillEdge = z.infer<typeof SkillEdgeSchema>;

export const SkillGraphSchema = z
  .object({
    nodes: z.array(SkillNodeSchema).min(1),
    edges: z.array(SkillEdgeSchema).default([]),
  })
  .superRefine((graph, ctx) => {
    const ids = new Set(graph.nodes.map((n) => n.id));
    graph.edges.forEach((edge, index) => {
      if (!ids.has(edge.source)) {
        ctx.addIssue({
          code: "custom",
          message: `edge[${index}].source "${edge.source}" has no matching node`,
          path: ["edges", index, "source"],
        });
      }
      if (!ids.has(edge.target)) {
        ctx.addIssue({
          code: "custom",
          message: `edge[${index}].target "${edge.target}" has no matching node`,
          path: ["edges", index, "target"],
        });
      }
    });
  });

export type SkillGraph = z.infer<typeof SkillGraphSchema>;
