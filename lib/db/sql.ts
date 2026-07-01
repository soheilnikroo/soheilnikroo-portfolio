import postgres from "postgres";

import { describeDatabaseUrl, getPostgresClientOptions } from "./connection-url";
import type { DbConnectOptions } from "./resilience";
import { withConnectTimeout } from "./resilience";
import { runMigrations } from "./schema";

type Sql = ReturnType<typeof postgres>;
declare global {
  var __portfolioSql: Sql | undefined;
  var __portfolioSchemaReady: Promise<void> | undefined;
  var __portfolioSchemaForceReady: Promise<void> | undefined;
  var __portfolioDbTargetLogged: boolean | undefined;
}
function logDatabaseTarget(url: string): void {
  if (globalThis.__portfolioDbTargetLogged) return;
  globalThis.__portfolioDbTargetLogged = true;
  console.info(`[db] target ${describeDatabaseUrl(url)}`);
}
export function getSql(): Sql {
  if (globalThis.__portfolioSql) return globalThis.__portfolioSql;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  }
  logDatabaseTarget(url);
  const client = postgres(url, getPostgresClientOptions(url));
  globalThis.__portfolioSql = client;
  return client;
}
export function ensureSchema(options?: DbConnectOptions): Promise<void> {
  const force = options?.force === true;
  if (force) {
    if (!globalThis.__portfolioSchemaForceReady) {
      globalThis.__portfolioSchemaForceReady = withConnectTimeout(() => runMigrations(getSql()), {
        force: true,
      });
    }
    return globalThis.__portfolioSchemaForceReady;
  }
  if (!globalThis.__portfolioSchemaReady) {
    globalThis.__portfolioSchemaReady = withConnectTimeout(() => runMigrations(getSql()));
  }
  return globalThis.__portfolioSchemaReady;
}
