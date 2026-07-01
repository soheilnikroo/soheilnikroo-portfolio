import { resolveDbConnectOptions } from "./request-context";
import type { DbConnectOptions } from "./resilience";
import { withConnectTimeout } from "./resilience";
import { ensureSchema, getSql } from "./sql";

export type SiteContentKey = "profile" | "skills" | "milestones" | "site" | "world";
export type SiteContentRow = {
  key: SiteContentKey;
  data: unknown;
  updated_at: Date;
};

export async function getSiteContentRow(
  key: SiteContentKey,
  options?: DbConnectOptions,
): Promise<SiteContentRow | null> {
  const readOptions = await resolveDbConnectOptions(options);
  return withConnectTimeout(
    async () => {
      await ensureSchema(readOptions);
      const sql = getSql();
      const rows = await sql<SiteContentRow[]>`
      SELECT key, data, updated_at FROM site_content WHERE key = ${key} LIMIT 1
    `;
      return rows[0] ?? null;
    },
    readOptions.force ? { force: true } : readOptions,
  );
}

export async function upsertSiteContentRow(key: SiteContentKey, data: unknown): Promise<void> {
  await ensureSchema({ force: true });
  const sql = getSql();
  await sql`
    INSERT INTO site_content (key, data)
    VALUES (${key}, ${sql.json(data as Parameters<typeof sql.json>[0])})
    ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
  `;
}
