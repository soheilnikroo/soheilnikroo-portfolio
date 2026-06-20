import { z } from "zod";

/** Frontmatter authored in each content/blog/*.mdx file. */
export const PostFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.iso.date(),
  updated: z.iso.date().optional(),
  category: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
});

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>;

/** Listing-level metadata derived from frontmatter + computed fields. */
export const PostMetaSchema = PostFrontmatterSchema.extend({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
  readingMinutes: z.number().nonnegative(),
});

export type PostMeta = z.infer<typeof PostMetaSchema>;
