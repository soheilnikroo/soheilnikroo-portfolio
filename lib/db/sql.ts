import postgres from "postgres";

import { runMigrations } from "./schema";

type Sql = ReturnType<typeof postgres>;

declare global {
  var __portfolioSql: Sql | undefined;
  var __portfolioSchemaReady: Promise<void> | undefined;
}

/** Lazily-created Postgres client (pooled). Safe to import at build time —
 * a connection is only opened when a query actually runs. */
export function getSql(): Sql {
  if (globalThis.__portfolioSql) return globalThis.__portfolioSql;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  }
  const client = postgres(url, { max: 10, idle_timeout: 20, connect_timeout: 8, prepare: false });
  globalThis.__portfolioSql = client;
  return client;
}

/** Ensures the posts table exists. Memoized so it runs at most once per process. */
export function ensureSchema(): Promise<void> {
  if (!globalThis.__portfolioSchemaReady) {
    globalThis.__portfolioSchemaReady = runMigrations(getSql());
  }
  return globalThis.__portfolioSchemaReady;
}
