import postgres from "postgres";

import {
  describeDatabaseUrl,
  getPostgresClientOptions,
  resolveRuntimeDatabaseUrl,
} from "./connection-url";
import { resolveDbConnectOptions } from "./request-context";
import type { DbConnectOptions } from "./resilience";
import { withConnectTimeout } from "./resilience";
import { runMigrations } from "./schema";

type Sql = ReturnType<typeof postgres>;

declare global {
  var __portfolioSql: Sql | undefined;
  var __portfolioSchemaReady: Promise<void> | undefined;
  var __portfolioDbTargetLogged: boolean | undefined;
}

function logDatabaseTarget(url: string): void {
  if (globalThis.__portfolioDbTargetLogged) return;
  globalThis.__portfolioDbTargetLogged = true;
  console.info(`[db] target ${describeDatabaseUrl(url)}`);
}

/** Drop a stale client so the next query opens a fresh TCP connection. */
export function resetSqlClient(): void {
  const client = globalThis.__portfolioSql;
  globalThis.__portfolioSql = undefined;
  globalThis.__portfolioSchemaReady = undefined;
  if (client) void client.end({ timeout: 5 }).catch(() => {});
}

export function getSql(): Sql {
  if (globalThis.__portfolioSql) return globalThis.__portfolioSql;
  const url = process.env.DATABASE_URL?.trim().replace(/^["']|["']$/g, "");
  if (!url) {
    throw new Error(
      process.env.NODE_ENV === "production"
        ? "Content store is not configured"
        : "DATABASE_URL is not set. Copy .env.example to .env and fill it in.",
    );
  }
  logDatabaseTarget(url);
  const runtimeUrl = resolveRuntimeDatabaseUrl(url);
  const client = postgres(runtimeUrl, getPostgresClientOptions(runtimeUrl));
  globalThis.__portfolioSql = client;
  return client;
}

async function migrate(options?: DbConnectOptions): Promise<void> {
  try {
    await withConnectTimeout(() => runMigrations(getSql()), options);
  } catch (error) {
    resetSqlClient();
    throw error;
  }
}

/** Ensures tables exist. Skipped on production reads — run `pnpm db:seed` once to migrate. */
export async function ensureSchema(options?: DbConnectOptions): Promise<void> {
  const resolved = await resolveDbConnectOptions(options);
  if (process.env.NODE_ENV === "production" && !resolved.force) {
    return;
  }
  if (globalThis.__portfolioSchemaReady) return globalThis.__portfolioSchemaReady;

  globalThis.__portfolioSchemaReady = migrate(resolved).catch((error) => {
    globalThis.__portfolioSchemaReady = undefined;
    throw error;
  });
  return globalThis.__portfolioSchemaReady;
}
