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
const ADMIN_CONNECT_TIMEOUT_MS = process.env.VERCEL ? 9_000 : 60_000;
const BUILD_CONNECT_TIMEOUT_MS = 10_000;
const PUBLIC_ATTEMPTS = 1;
const BUILD_ATTEMPTS = 1;
const ADMIN_ATTEMPTS = process.env.VERCEL ? 1 : 2;

export function connectTimeoutMs(options?: DbConnectOptions): number {
  if (options?.fastFail) return PUBLIC_CONNECT_TIMEOUT_MS;
  if (options?.quick) return QUICK_CONNECT_TIMEOUT_MS;
  if (options?.force || options?.preferLive) return ADMIN_CONNECT_TIMEOUT_MS;
  if (isNextProductionBuild()) return BUILD_CONNECT_TIMEOUT_MS;
  return PUBLIC_CONNECT_TIMEOUT_MS;
}

function connectAttempts(options?: DbConnectOptions): number {
  if (options?.fastFail) return PUBLIC_ATTEMPTS;
  if (options?.quick) return 1;
  if (options?.force || options?.preferLive) return ADMIN_ATTEMPTS;
  if (isNextProductionBuild()) return BUILD_ATTEMPTS;
  return PUBLIC_ATTEMPTS;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldResetSqlClient(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /TIMEOUT|CONNECT|ECONN|CIRCUIT|terminated|closed/i.test(message);
}

async function resetSqlClientAfterFailure(error: unknown): Promise<void> {
  if (!shouldResetSqlClient(error)) return;
  const { resetSqlClient } = await import("./sql");
  resetSqlClient();
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
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (attempt > 0) await sleep(2_000 * attempt);

    try {
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("DATABASE_CONNECT_TIMEOUT")), timeoutMs);
        }),
      ]);
      resetDbCircuit();
      return result;
    } catch (error) {
      lastError = error;
      await resetSqlClientAfterFailure(error);
      const message = error instanceof Error ? error.message : String(error);
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[db] connect attempt ${attempt + 1}/${attempts} failed: ${message}`);
      }
    }
  }

  if (shouldUseCircuitBreaker(options)) openDbCircuit();
  await resetSqlClientAfterFailure(lastError);
  throw lastError;
}
