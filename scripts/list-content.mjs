#!/usr/bin/env node
import postgres from "postgres";

import { printDatabaseUrlHelp, resolveDatabaseUrl } from "./db-url.mjs";

const url = resolveDatabaseUrl();
if (!url) {
  printDatabaseUrlHelp();
  process.exit(1);
}

const sql = postgres(url, {
  max: 1,
  prepare: false,
  connect_timeout: 30,
  ssl: url.includes("supabase.com") || url.includes("supabase.co") ? "require" : undefined,
});

try {
  const posts = await sql`
    SELECT slug, title, published FROM posts ORDER BY date DESC
  `;
  const projects = await sql`SELECT slug FROM projects ORDER BY slug`;
  const site = await sql`SELECT key FROM site_content ORDER BY key`;

  console.log(`posts (${posts.length})`);
  for (const row of posts) {
    console.log(`  - ${row.slug}  published=${row.published}  ${row.title}`);
  }
  console.log(`projects (${projects.length})`);
  for (const row of projects) console.log(`  - ${row.slug}`);
  console.log(`site_content (${site.length})`);
  for (const row of site) console.log(`  - ${row.key}`);
} catch (error) {
  console.error("FAILED:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
