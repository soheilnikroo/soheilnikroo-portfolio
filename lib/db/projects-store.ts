import { randomUUID } from "node:crypto";

import type { Project } from "@/lib/schemas";

import { resolveDbConnectOptions } from "./request-context";
import type { DbConnectOptions } from "./resilience";
import { PUBLIC_READ, withConnectTimeout } from "./resilience";
import { ensureSchema, getSql } from "./sql";

export type ProjectRow = {
  id: string;
  slug: string;
  data: Project;
  created_at: Date;
  updated_at: Date;
};
export async function listProjectRows(options?: DbConnectOptions): Promise<ProjectRow[]> {
  const readOptions = await resolveDbConnectOptions(options ?? PUBLIC_READ);
  return withConnectTimeout(
    async () => {
      await ensureSchema(readOptions);
      const sql = getSql();
      const rows = await sql<ProjectRow[]>`
    SELECT id, slug, data, created_at, updated_at
    FROM projects
    ORDER BY (data->>'order')::int NULLS LAST, (data->>'year')::int DESC NULLS LAST
  `;
      return [...rows];
    },
    readOptions.force ? { force: true } : readOptions,
  );
}
export async function getProjectRowById(
  id: string,
  options?: DbConnectOptions,
): Promise<ProjectRow | null> {
  const readOptions = await resolveDbConnectOptions(options);
  return withConnectTimeout(
    async () => {
      await ensureSchema(readOptions);
      const sql = getSql();
      const rows = await sql<ProjectRow[]>`SELECT * FROM projects WHERE id = ${id} LIMIT 1`;
      return rows[0] ?? null;
    },
    readOptions.force ? { force: true } : readOptions,
  );
}
export async function getProjectRowBySlug(
  slug: string,
  options?: DbConnectOptions,
): Promise<ProjectRow | null> {
  const readOptions = await resolveDbConnectOptions(options ?? PUBLIC_READ);
  return withConnectTimeout(
    async () => {
      await ensureSchema(readOptions);
      const sql = getSql();
      const rows = await sql<ProjectRow[]>`SELECT * FROM projects WHERE slug = ${slug} LIMIT 1`;
      return rows[0] ?? null;
    },
    readOptions.force ? { force: true } : readOptions,
  );
}
export async function createProjectRow(slug: string, data: Project): Promise<ProjectRow> {
  return withConnectTimeout(
    async () => {
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
    },
    { force: true },
  );
}
export async function updateProjectRow(
  id: string,
  slug: string,
  data: Project,
): Promise<ProjectRow | null> {
  return withConnectTimeout(
    async () => {
      await ensureSchema({ force: true });
      const sql = getSql();
      const rows = await sql<ProjectRow[]>`
    UPDATE projects SET slug = ${slug}, data = ${sql.json(data)}, updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
      return rows[0] ?? null;
    },
    { force: true },
  );
}
export async function deleteProjectRow(id: string): Promise<boolean> {
  return withConnectTimeout(
    async () => {
      await ensureSchema({ force: true });
      const sql = getSql();
      const rows = await sql<ProjectRow[]>`DELETE FROM projects WHERE id = ${id} RETURNING id`;
      return rows.length > 0;
    },
    { force: true },
  );
}
export async function upsertProjectRow(slug: string, data: Project): Promise<void> {
  await withConnectTimeout(
    async () => {
      await ensureSchema({ force: true });
      const sql = getSql();
      const existing = await sql<ProjectRow[]>`SELECT * FROM projects WHERE slug = ${slug} LIMIT 1`;
      if (existing[0]) {
        await sql`
          UPDATE projects SET slug = ${slug}, data = ${sql.json(data)}, updated_at = now()
          WHERE id = ${existing[0].id}
        `;
        return;
      }
      const id = randomUUID();
      await sql`
        INSERT INTO projects (id, slug, data)
        VALUES (${id}, ${slug}, ${sql.json(data)})
      `;
    },
    { force: true },
  );
}
