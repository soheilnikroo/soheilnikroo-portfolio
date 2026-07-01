import { randomUUID } from "node:crypto";

import type { Project } from "@/lib/schemas";

import { ensureSchema, getSql } from "./sql";

export type ProjectRow = {
  id: string;
  slug: string;
  data: Project;
  created_at: Date;
  updated_at: Date;
};
export async function listProjectRows(options?: { force?: boolean }): Promise<ProjectRow[]> {
  await ensureSchema(options);
  const sql = getSql();
  const rows = await sql<ProjectRow[]>`
    SELECT id, slug, data, created_at, updated_at FROM projects ORDER BY (data->>'order')::int, (data->>'year')::int DESC
  `;
  return [...rows];
}
export async function getProjectRowById(
  id: string,
  options?: {
    force?: boolean;
  },
): Promise<ProjectRow | null> {
  await ensureSchema(options);
  const sql = getSql();
  const rows = await sql<ProjectRow[]>`SELECT * FROM projects WHERE id = ${id} LIMIT 1`;
  return rows[0] ?? null;
}
export async function getProjectRowBySlug(slug: string): Promise<ProjectRow | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql<ProjectRow[]>`SELECT * FROM projects WHERE slug = ${slug} LIMIT 1`;
  return rows[0] ?? null;
}
export async function createProjectRow(slug: string, data: Project): Promise<ProjectRow> {
  await ensureSchema({ force: true });
  const sql = getSql();
  const id = randomUUID();
  const rows = await sql<ProjectRow[]>`
    INSERT INTO projects (id, slug, data)
    VALUES (${id}, ${slug}, ${sql.json(data)})
    RETURNING *
  `;
  if (!rows[0]) throw new Error("Failed to create project");
  return rows[0];
}
export async function updateProjectRow(
  id: string,
  slug: string,
  data: Project,
): Promise<ProjectRow | null> {
  await ensureSchema({ force: true });
  const sql = getSql();
  const rows = await sql<ProjectRow[]>`
    UPDATE projects SET slug = ${slug}, data = ${sql.json(data)}, updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ?? null;
}
export async function deleteProjectRow(id: string): Promise<boolean> {
  await ensureSchema({ force: true });
  const sql = getSql();
  const rows = await sql<ProjectRow[]>`DELETE FROM projects WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
export async function upsertProjectRow(slug: string, data: Project): Promise<void> {
  await ensureSchema({ force: true });
  const existing = await getProjectRowBySlug(slug);
  if (existing) {
    await updateProjectRow(existing.id, slug, data);
    return;
  }
  await createProjectRow(slug, data);
}
