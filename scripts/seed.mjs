import { randomUUID } from "node:crypto";
// Import existing content/blog/*.mdx posts into Postgres.
// Run: pnpm db:seed   (reads DATABASE_URL from .env)
import { promises as fs } from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Run with: node --env-file=.env scripts/seed.mjs");
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false });
const dir = path.join(process.cwd(), "content", "blog");

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id text PRIMARY KEY, slug text UNIQUE NOT NULL, title text NOT NULL,
      description text NOT NULL, category text NOT NULL, tags text[] NOT NULL DEFAULT '{}',
      body text NOT NULL, cover text, published boolean NOT NULL DEFAULT false,
      date timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`;

  let files = [];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".mdx"));
  } catch {
    console.log("No content/blog directory — nothing to seed.");
    return;
  }

  for (const file of files) {
    const raw = await fs.readFile(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const slug = file.replace(/\.mdx$/u, "");
    await sql`
      INSERT INTO posts (id, slug, title, description, category, tags, body, cover, published, date)
      VALUES (
        ${randomUUID()}, ${slug}, ${data.title}, ${data.description}, ${data.category},
        ${sql.array(data.tags ?? [])}, ${content}, ${data.cover ?? null},
        ${!(data.draft ?? false)}, ${data.date ? new Date(data.date) : new Date()}
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title, description = EXCLUDED.description, category = EXCLUDED.category,
        tags = EXCLUDED.tags, body = EXCLUDED.body, cover = EXCLUDED.cover,
        published = EXCLUDED.published, date = EXCLUDED.date, updated_at = now()
    `;
    console.log("seeded", slug);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
