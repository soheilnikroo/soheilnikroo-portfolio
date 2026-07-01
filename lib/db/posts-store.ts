import { randomUUID } from "node:crypto";

import type { DbConnectOptions } from "./resilience";
import { withConnectTimeout } from "./resilience";
import { ensureSchema, getSql } from "./sql";
import { normalizeTextArray, sqlTextArray } from "./text-array";

export type PostRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  body: string;
  cover: string | null;
  published: boolean;
  date: Date;
  created_at: Date;
  updated_at: Date;
};
export type PostInput = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  body: string;
  cover?: string | null;
  published: boolean;
  date: Date;
};
function normalizePostRow(row: PostRow): PostRow {
  return { ...row, tags: normalizeTextArray(row.tags) };
}
export async function listPostRows(
  includeDrafts = false,
  options?: DbConnectOptions,
): Promise<PostRow[]> {
  return withConnectTimeout(
    async () => {
      await ensureSchema(options);
      const sql = getSql();
      const rows = includeDrafts
        ? await sql<PostRow[]>`SELECT * FROM posts ORDER BY date DESC`
        : await sql<PostRow[]>`SELECT * FROM posts WHERE published = true ORDER BY date DESC`;
      return rows.map(normalizePostRow);
    },
    options?.force ? { force: true } : options?.quick ? { quick: true } : undefined,
  );
}
export async function getPostRowBySlug(slug: string): Promise<PostRow | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql<PostRow[]>`SELECT * FROM posts WHERE slug = ${slug} LIMIT 1`;
  return rows[0] ? normalizePostRow(rows[0]) : null;
}
export async function getPostRowById(
  id: string,
  options?: DbConnectOptions,
): Promise<PostRow | null> {
  await ensureSchema(options);
  const sql = getSql();
  const rows = await sql<PostRow[]>`SELECT * FROM posts WHERE id = ${id} LIMIT 1`;
  return rows[0] ? normalizePostRow(rows[0]) : null;
}
export async function createPostRow(input: PostInput): Promise<PostRow> {
  return withConnectTimeout(
    async () => {
      await ensureSchema({ force: true });
      const sql = getSql();
      const id = randomUUID();
      const rows = await sql<PostRow[]>`
    INSERT INTO posts (id, slug, title, description, category, tags, body, cover, published, date)
    VALUES (
      ${id}, ${input.slug}, ${input.title}, ${input.description}, ${input.category},
      ${sqlTextArray(input.tags)}::text[], ${input.body}, ${input.cover ?? null}, ${input.published}, ${input.date}
    )
    RETURNING *
  `;
      if (!rows[0]) throw new Error("Failed to create post");
      return normalizePostRow(rows[0]);
    },
    { force: true },
  );
}
export async function updatePostRow(id: string, input: PostInput): Promise<PostRow | null> {
  return withConnectTimeout(
    async () => {
      await ensureSchema({ force: true });
      const sql = getSql();
      const rows = await sql<PostRow[]>`
    UPDATE posts SET
      slug = ${input.slug},
      title = ${input.title},
      description = ${input.description},
      category = ${input.category},
      tags = ${sqlTextArray(input.tags)}::text[],
      body = ${input.body},
      cover = ${input.cover ?? null},
      published = ${input.published},
      date = ${input.date},
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
      return rows[0] ? normalizePostRow(rows[0]) : null;
    },
    { force: true },
  );
}
export async function deletePostRow(id: string): Promise<boolean> {
  return withConnectTimeout(
    async () => {
      await ensureSchema({ force: true });
      const sql = getSql();
      const rows = await sql<PostRow[]>`DELETE FROM posts WHERE id = ${id} RETURNING id`;
      return rows.length > 0;
    },
    { force: true },
  );
}
