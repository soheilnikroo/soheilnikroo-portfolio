import { promises as fs } from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import readingTime from "reading-time";

import { PostMetaSchema } from "@/lib/schemas";
import type { PostMeta } from "@/lib/schemas";

const blogDir = path.join(process.cwd(), "content", "blog");

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map(String);
  if (typeof tags === "string" && tags.trim()) {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

function toMeta(slug: string, data: Record<string, unknown>, body: string): PostMeta | null {
  try {
    const stats = readingTime(body);
    const date =
      typeof data.date === "string"
        ? data.date.slice(0, 10)
        : new Date().toISOString().slice(0, 10);
    return PostMetaSchema.parse({
      title: data.title,
      description: data.description,
      date,
      category: data.category,
      tags: normalizeTags(data.tags),
      cover: typeof data.cover === "string" ? data.cover : undefined,
      draft: Boolean(data.draft ?? false),
      slug,
      readingMinutes: Math.max(1, Math.round(stats.minutes)),
    });
  } catch {
    return null;
  }
}

async function listMdxFiles(): Promise<string[]> {
  try {
    const files = await fs.readdir(blogDir);
    return files.filter((file) => file.endsWith(".mdx"));
  } catch {
    return [];
  }
}

export async function loadPostMetaFromDisk(includeDrafts = false): Promise<PostMeta[]> {
  const files = await listMdxFiles();
  const metas: PostMeta[] = [];

  for (const file of files) {
    const slug = file.replace(/\.mdx$/u, "");
    const raw = await fs.readFile(path.join(blogDir, file), "utf8");
    const { data, content } = matter(raw);
    const meta = toMeta(slug, data as Record<string, unknown>, content);
    if (!meta) continue;
    if (!includeDrafts && meta.draft) continue;
    metas.push(meta);
  }

  return metas.sort((a, b) => b.date.localeCompare(a.date));
}

export async function loadPostSourceFromDisk(
  slug: string,
  includeDrafts = false,
): Promise<{ meta: PostMeta; content: string } | null> {
  const filePath = path.join(blogDir, `${slug}.mdx`);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const meta = toMeta(slug, data as Record<string, unknown>, content);
    if (!meta) return null;
    if (!includeDrafts && meta.draft) return null;
    return { meta, content };
  } catch {
    return null;
  }
}
