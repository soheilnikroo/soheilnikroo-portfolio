import { z } from "zod";

/** The five-beat narrative every project "destination" tells. */
export const ProjectNarrativeSchema = z.object({
  problem: z.string().min(1),
  challenge: z.string().min(1),
  process: z.string().min(1),
  solution: z.string().min(1),
  outcome: z.string().min(1),
});

export type ProjectNarrative = z.infer<typeof ProjectNarrativeSchema>;

export const ProjectStatusSchema = z.enum(["live", "in-progress", "archived", "concept"]);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectLinksSchema = z.object({
  live: z.url().optional(),
  repo: z.url().optional(),
  caseStudy: z.url().optional(),
});

export const ProjectSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
  title: z.string().min(1),
  summary: z.string().min(1),
  year: z.number().int().gte(2000).lte(2100),
  role: z.string().min(1),
  status: ProjectStatusSchema.default("live"),
  tags: z.array(z.string().min(1)).default([]),
  tech: z.array(z.string().min(1)).default([]),
  links: ProjectLinksSchema.default({}),
  cover: z.string().optional(),
  accent: z.string().optional(),
  narrative: ProjectNarrativeSchema,
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
});

export type Project = z.infer<typeof ProjectSchema>;
