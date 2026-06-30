import type postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

/** Idempotent schema bootstrap — creates the posts table on first DB use,
 * so there is no separate migration step to run. */
export async function runMigrations(sql: Sql): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id          text PRIMARY KEY,
      slug        text UNIQUE NOT NULL,
      title       text NOT NULL,
      description text NOT NULL,
      category    text NOT NULL,
      tags        text[] NOT NULL DEFAULT '{}',
      body        text NOT NULL,
      cover       text,
      published   boolean NOT NULL DEFAULT false,
      date        timestamptz NOT NULL DEFAULT now(),
      created_at  timestamptz NOT NULL DEFAULT now(),
      updated_at  timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS posts_published_date_idx ON posts (published, date DESC)`;

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id          text PRIMARY KEY,
      slug        text UNIQUE NOT NULL,
      data        jsonb NOT NULL,
      created_at  timestamptz NOT NULL DEFAULT now(),
      updated_at  timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS projects_slug_idx ON projects (slug)`;

  await sql`
    CREATE TABLE IF NOT EXISTS site_content (
      key         text PRIMARY KEY,
      data        jsonb NOT NULL,
      updated_at  timestamptz NOT NULL DEFAULT now()
    )
  `;
}
