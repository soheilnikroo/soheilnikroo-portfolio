import { promises as fs } from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import readingTime from "reading-time";

import { PostFrontmatterSchema, PostMetaSchema } from "@/lib/schemas";
import type { PostMeta } from "@/lib/schemas";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostSource = {
  meta: PostMeta;
  /** Raw MDX body (frontmatter stripped). Rendered by the blog system in Step 12. */
  content: string;
};

function slugFromFile(file: string): string {
  return file.replace(/\.mdx$/u, "");
}

async function listPostFiles(): Promise<string[]> {
  try {
    const entries = await fs.readdir(BLOG_DIR);
    return entries.filter((file) => file.endsWith(".mdx"));
  } catch {
    return [];
  }
}

async function readPostFile(file: string): Promise<PostSource> {
  const slug = slugFromFile(file);
  const raw = await fs.readFile(path.join(BLOG_DIR, file), "utf8");
  const parsed = matter(raw);

  const front = PostFrontmatterSchema.safeParse(parsed.data);
  if (!front.success) {
    throw new Error(
      `Invalid frontmatter in content/blog/${file}: ${front.error.issues
        .map((issue) => `${issue.path.join(".")} ${issue.message}`)
        .join("; ")}`,
    );
  }

  const stats = readingTime(parsed.content);
  const meta = PostMetaSchema.parse({
    ...front.data,
    slug,
    readingMinutes: Math.max(1, Math.round(stats.minutes)),
  });

  return { meta, content: parsed.content };
}

async function readAllPosts(): Promise<PostSource[]> {
  const files = await listPostFiles();
  return Promise.all(files.map(readPostFile));
}

function byNewest(a: PostMeta, b: PostMeta): number {
  return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
}

export async function getAllPostMeta(includeDrafts = false): Promise<PostMeta[]> {
  const posts = await readAllPosts();
  const metas = posts.map((post) => post.meta);
  const visible = includeDrafts ? metas : metas.filter((meta) => !meta.draft);
  return visible.sort(byNewest);
}

export async function getPostMetaBySlug(
  slug: string,
  includeDrafts = true,
): Promise<PostMeta | null> {
  const metas = await getAllPostMeta(includeDrafts);
  return metas.find((meta) => meta.slug === slug) ?? null;
}

export async function getPostSource(slug: string): Promise<PostSource | null> {
  const posts = await readAllPosts();
  return posts.find((post) => post.meta.slug === slug) ?? null;
}

export async function getAllCategories(): Promise<string[]> {
  const metas = await getAllPostMeta();
  return [...new Set(metas.map((meta) => meta.category))].sort();
}

export async function getAllTags(): Promise<string[]> {
  const metas = await getAllPostMeta();
  return [...new Set(metas.flatMap((meta) => meta.tags))].sort();
}
