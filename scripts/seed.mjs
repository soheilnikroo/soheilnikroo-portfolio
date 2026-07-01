import { randomUUID } from "node:crypto";
// Seed blog posts, projects, profile, skills, and milestones into Postgres (Supabase).
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

const sql = postgres(url, {
  max: 1,
  prepare: false,
  connect_timeout: 25,
  ssl: url.includes("supabase.com") || url.includes("supabase.co") ? "require" : undefined,
  connection: {
    application_name: "soheilnikroo-seed",
  },
});
const root = process.cwd();
const blogDir = path.join(root, "content", "blog");
const seedDir = path.join(root, "content", "seed");

async function readJson(name) {
  const raw = await fs.readFile(path.join(seedDir, name), "utf8");
  return JSON.parse(raw);
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map(String);
  if (typeof tags === "string" && tags.trim()) return tags.split(",").map((t) => t.trim());
  return [];
}

/** Bind text[] for Supabase transaction pooler (prepare: false). */
function pgTextArrayLiteral(values) {
  if (values.length === 0) return "{}";
  return `{${values
    .map((value) => `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
    .join(",")}}`;
}

async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id text PRIMARY KEY, slug text UNIQUE NOT NULL, title text NOT NULL,
      description text NOT NULL, category text NOT NULL, tags text[] NOT NULL DEFAULT '{}',
      body text NOT NULL, cover text, published boolean NOT NULL DEFAULT false,
      date timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS posts_published_date_idx ON posts (published, date DESC)`;

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id text PRIMARY KEY, slug text UNIQUE NOT NULL, data jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS projects_slug_idx ON projects (slug)`;

  await sql`
    CREATE TABLE IF NOT EXISTS site_content (
      key text PRIMARY KEY, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
    )`;
}

async function seedBlogPosts() {
  let files = [];
  try {
    files = (await fs.readdir(blogDir)).filter((f) => f.endsWith(".mdx"));
  } catch {
    console.log("No content/blog directory — skipping blog seed.");
    return;
  }

  for (const file of files) {
    const raw = await fs.readFile(path.join(blogDir, file), "utf8");
    const { data, content } = matter(raw);
    const slug = file.replace(/\.mdx$/u, "");
    const tags = normalizeTags(data.tags);
    await sql`
      INSERT INTO posts (id, slug, title, description, category, tags, body, cover, published, date)
      VALUES (
        ${randomUUID()}, ${slug}, ${data.title}, ${data.description}, ${data.category},
        ${pgTextArrayLiteral(tags)}::text[], ${content}, ${data.cover ?? null},
        ${!(data.draft ?? false)}, ${data.date ? new Date(data.date) : new Date()}
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title, description = EXCLUDED.description, category = EXCLUDED.category,
        tags = ${pgTextArrayLiteral(tags)}::text[], body = EXCLUDED.body, cover = EXCLUDED.cover,
        published = EXCLUDED.published, date = EXCLUDED.date, updated_at = now()
    `;
    console.log("seeded post", slug);
  }
}

async function seedProjects() {
  const projects = await readJson("projects.json");
  for (const project of projects) {
    await sql`
      INSERT INTO projects (id, slug, data)
      VALUES (${randomUUID()}, ${project.slug}, ${sql.json(project)})
      ON CONFLICT (slug) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
    `;
    console.log("seeded project", project.slug);
  }
}

async function seedSiteContent() {
  const entries = [
    ["profile", await readJson("profile.json")],
    ["skills", await readJson("skills.json")],
    ["milestones", await readJson("milestones.json")],
    ["site", await readJson("site.json")],
    ["world", await readJson("world.json")],
  ];
  for (const [key, data] of entries) {
    await sql`
      INSERT INTO site_content (key, data)
      VALUES (${key}, ${sql.json(data)})
      ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
    `;
    console.log("seeded site content", key);
  }
}

async function main() {
  await ensureSchema();
  await seedBlogPosts();
  await seedProjects();
  await seedSiteContent();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
