import postgres from "postgres";

import {
  describeDatabaseUrl,
  getPostgresClientOptions,
  listDatabaseUrlCandidates,
  needsEphemeralDbConnections,
  normalizeEnvDatabaseUrl,
  resolveRuntimeDatabaseUrl,
} from "./connection-url";
import type { DbConnectOptions } from "./resilience";
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

async function migrate(): Promise<void> {
  try {
    await runMigrations(getSql());
  } catch (error) {
    resetSqlClient();
    throw error;
  }
}

/** Ensures tables exist. Production schema is provisioned via `pnpm db:seed` — not at request time. */
export async function ensureSchema(_options?: DbConnectOptions): Promise<void> {
  if (process.env.NODE_ENV === "production") return;
  if (globalThis.__portfolioSchemaReady) return globalThis.__portfolioSchemaReady;

  globalThis.__portfolioSchemaReady = migrate().catch((error) => {
    globalThis.__portfolioSchemaReady = undefined;
    throw error;
  });
  return globalThis.__portfolioSchemaReady;
}
