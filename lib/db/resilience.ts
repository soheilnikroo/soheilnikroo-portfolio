import {
  describeDatabaseUrl,
  listDatabaseUrlCandidates,
  needsEphemeralDbConnections,
} from "./connection-url";
import { isNextProductionBuild } from "./request-context";

const CIRCUIT_COOLDOWN_MS = 30_000;
let circuitOpenUntil = 0;
let failureStreak = 0;

export function isDbCircuitOpen(): boolean {
  return Date.now() < circuitOpenUntil;
}

export function openDbCircuit(): void {
  failureStreak += 1;
  if (failureStreak >= 2) {
    circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
  }
}

export function resetDbCircuit(): void {
  circuitOpenUntil = 0;
  failureStreak = 0;
}

export type DbConnectOptions = {
  /** Admin writes bypass the circuit breaker and use a longer timeout. */
  force?: boolean;
  /** Fail fast (build-time SSG). */
  quick?: boolean;
  /** Live CMS reads: bypass circuit breaker, use admin read timeout. */
  preferLive?: boolean;
  /** Public pages with bundled fallbacks: short timeout, single attempt, circuit breaker on. */
  fastFail?: boolean;
};

export const LIVE_READ: DbConnectOptions = { preferLive: true };
export const PUBLIC_READ: DbConnectOptions = { fastFail: true };

function shouldUseCircuitBreaker(options?: DbConnectOptions): boolean {
  if (options?.force || options?.quick || options?.preferLive) return false;
  return true;
}

const PUBLIC_CONNECT_TIMEOUT_MS = 12_000;
const QUICK_CONNECT_TIMEOUT_MS = 30_000;
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const ADMIN_CONNECT_TIMEOUT_MS = IS_SERVERLESS ? 9_000 : 60_000;
const BUILD_CONNECT_TIMEOUT_MS = 10_000;
const PUBLIC_ATTEMPTS = 1;
const BUILD_ATTEMPTS = 1;
const ADMIN_ATTEMPTS = IS_SERVERLESS ? 1 : 2;
const HOSTED_ATTEMPTS = 3;

let hostedConnectChain: Promise<void> = Promise.resolve();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withHostedConnectMutex<T>(fn: () => Promise<T>): Promise<T> {
  const previous = hostedConnectChain;
  let release!: () => void;
  hostedConnectChain = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    return await fn();
  } finally {
    release();
  }
}

function retryDelayMs(attempt: number, ephemeral: boolean, dnsError: boolean): number {
  if (dnsError) return 5_000 * attempt;
  return (ephemeral ? 3_000 : 2_000) * attempt;
}

function isDnsError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(message);
}

export function connectTimeoutMs(options?: DbConnectOptions): number {
  if (options?.fastFail) return PUBLIC_CONNECT_TIMEOUT_MS;
  if (options?.quick) return QUICK_CONNECT_TIMEOUT_MS;
  if (options?.force || options?.preferLive) {
    return needsEphemeralDbConnections() ? 25_000 : ADMIN_CONNECT_TIMEOUT_MS;
  }
  if (isNextProductionBuild()) return BUILD_CONNECT_TIMEOUT_MS;
  return PUBLIC_CONNECT_TIMEOUT_MS;
}

function connectAttempts(options?: DbConnectOptions): number {
  if (needsEphemeralDbConnections() && (options?.force || options?.preferLive)) {
    return HOSTED_ATTEMPTS;
  }
  if (options?.fastFail) return PUBLIC_ATTEMPTS;
  if (options?.quick) return 1;
  if (options?.force || options?.preferLive) return ADMIN_ATTEMPTS;
  if (isNextProductionBuild()) return BUILD_ATTEMPTS;
  return PUBLIC_ATTEMPTS;
}

function shouldResetSqlClient(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /TIMEOUT|CONNECT|DESTROY|ENOTFOUND|EAI_AGAIN|getaddrinfo|ECONN|CIRCUIT|terminated|closed/i.test(
    message,
  );
}

function resetSqlClientAfterFailure(error: unknown): void {
  if (!shouldResetSqlClient(error)) return;
  void import("./sql").then(({ resetSqlClient }) => resetSqlClient());
}

async function runConnectAttempts<T>(
  operation: () => Promise<T>,
  options: DbConnectOptions | undefined,
  timeoutMs: number,
  attempts: number,
): Promise<T> {
  const ephemeral = needsEphemeralDbConnections();
  const urlCandidates = ephemeral ? listDatabaseUrlCandidates() : [null];
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (attempt > 0) {
      const delay = retryDelayMs(attempt, ephemeral, isDnsError(lastError));
      await sleep(delay);
    }

    for (const databaseUrl of urlCandidates) {
      const sqlModule = ephemeral ? await import("./sql") : null;
      if (sqlModule) sqlModule.mountEphemeralSql(databaseUrl ?? undefined);

      try {
        const result = await Promise.race([
          operation(),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error("DATABASE_CONNECT_TIMEOUT")), timeoutMs);
          }),
        ]);
        if (databaseUrl && ephemeral) {
          console.info(`[db] connected via ${describeDatabaseUrl(databaseUrl)}`);
        }
        resetDbCircuit();
        return result;
      } catch (error) {
        lastError = error;
        resetSqlClientAfterFailure(error);
        const message = error instanceof Error ? error.message : String(error);
        const target = databaseUrl ? describeDatabaseUrl(databaseUrl) : "default";
        console.warn(
          `[db] connect attempt ${attempt + 1}/${attempts} via ${target} failed: ${message}`,
        );
      } finally {
        if (sqlModule) sqlModule.resetSqlClient();
      }
    }
  }

  throw lastError;
}

export async function withConnectTimeout<T>(
  operation: () => Promise<T>,
  options?: DbConnectOptions,
): Promise<T> {
  const bypassCircuit = !shouldUseCircuitBreaker(options);
  if (!bypassCircuit && isDbCircuitOpen()) {
    throw new Error("DATABASE_CIRCUIT_OPEN");
  }

  const timeoutMs = connectTimeoutMs(options);
  const attempts = connectAttempts(options);

  try {
    if (needsEphemeralDbConnections()) {
      return await withHostedConnectMutex(() =>
        runConnectAttempts(operation, options, timeoutMs, attempts),
      );
    }
    return await runConnectAttempts(operation, options, timeoutMs, attempts);
  } catch (error) {
    if (shouldUseCircuitBreaker(options)) openDbCircuit();
    resetSqlClientAfterFailure(error);
    throw error;
  }
}
