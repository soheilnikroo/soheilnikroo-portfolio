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

/** Payload accepted by the admin panel when creating/updating a post. */
export const PostInputSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  body: z.string().min(1),
  cover: z.string().optional().nullable(),
  published: z.boolean().default(false),
  date: z.iso.date(),
});

export type PostInputValues = z.infer<typeof PostInputSchema>;
