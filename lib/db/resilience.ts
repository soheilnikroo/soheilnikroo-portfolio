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
  /** Live CMS reads: bypass circuit breaker, use normal read timeout. */
  preferLive?: boolean;
};

export const LIVE_READ: DbConnectOptions = { preferLive: true };

function shouldUseCircuitBreaker(options?: DbConnectOptions): boolean {
  if (options?.force || options?.quick || options?.preferLive) return false;
  return !process.env.DATABASE_URL;
}

const QUICK_CONNECT_TIMEOUT_MS = 30_000;
const READ_CONNECT_TIMEOUT_MS = process.env.NODE_ENV === "production" ? 90_000 : 35_000;
const BUILD_CONNECT_TIMEOUT_MS = 10_000;
const ADMIN_CONNECT_TIMEOUT_MS = 45_000;
const READ_ATTEMPTS = process.env.NODE_ENV === "production" ? 3 : 1;
const BUILD_ATTEMPTS = 1;
const ADMIN_ATTEMPTS = 2;

export function connectTimeoutMs(options?: DbConnectOptions): number {
  if (options?.quick) return QUICK_CONNECT_TIMEOUT_MS;
  if (options?.force) return ADMIN_CONNECT_TIMEOUT_MS;
  if (isNextProductionBuild()) return BUILD_CONNECT_TIMEOUT_MS;
  return READ_CONNECT_TIMEOUT_MS;
}

function connectAttempts(options?: DbConnectOptions): number {
  if (options?.quick) return 1;
  if (options?.force) return ADMIN_ATTEMPTS;
  if (isNextProductionBuild()) return BUILD_ATTEMPTS;
  return READ_ATTEMPTS;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
      const message = error instanceof Error ? error.message : String(error);
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[db] connect attempt ${attempt + 1}/${attempts} failed: ${message}`);
      }
    }
  }

  if (shouldUseCircuitBreaker(options)) openDbCircuit();
  throw lastError;
}
