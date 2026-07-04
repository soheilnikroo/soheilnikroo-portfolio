import postgres from "postgres";

import {
  describeDatabaseUrl,
  getPostgresClientOptions,
  listDatabaseUrlCandidates,
  needsEphemeralDbConnections,
  normalizeEnvDatabaseUrl,
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

function normalizeDatabaseUrl(): string {
  const url = normalizeEnvDatabaseUrl(process.env.DATABASE_URL);
  if (!url) {
    throw new Error(
      process.env.NODE_ENV === "production"
        ? "Content store is not configured"
        : "DATABASE_URL is not set. Copy .env.example to .env and fill it in.",
    );
  }
  return url;
}

function createSqlClient(databaseUrl?: string): Sql {
  const url = databaseUrl ?? listDatabaseUrlCandidates()[0] ?? normalizeDatabaseUrl();
  logDatabaseTarget(url);
  const runtimeUrl = resolveRuntimeDatabaseUrl(url);
  return postgres(runtimeUrl, getPostgresClientOptions(runtimeUrl));
}

/** Drop a stale client so the next query opens a fresh TCP connection. */
export function resetSqlClient(): void {
  const client = globalThis.__portfolioSql;
  globalThis.__portfolioSql = undefined;
  globalThis.__portfolioSchemaReady = undefined;
  if (client) void client.end({ timeout: 5 }).catch(() => {});
}

/** Hosted production: open a one-shot client for the current connect attempt. */
export function mountEphemeralSql(databaseUrl?: string): Sql {
  resetSqlClient();
  const client = createSqlClient(databaseUrl);
  globalThis.__portfolioSql = client;
  return client;
}

export function getSql(): Sql {
  if (globalThis.__portfolioSql) return globalThis.__portfolioSql;
  const client = createSqlClient();
  globalThis.__portfolioSql = client;
  return client;
}

export { needsEphemeralDbConnections };

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
