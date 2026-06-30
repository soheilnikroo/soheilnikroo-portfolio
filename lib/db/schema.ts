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
}
