/** Fast-fail when Postgres is unreachable so SSR does not block on connect_timeout. */

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
};

/** Must be >= postgres connect_timeout in lib/db/connection-url.ts */
const READ_CONNECT_TIMEOUT_MS = 32_000;
const ADMIN_CONNECT_TIMEOUT_MS = 45_000;

export function connectTimeoutMs(options?: DbConnectOptions): number {
  return options?.force ? ADMIN_CONNECT_TIMEOUT_MS : READ_CONNECT_TIMEOUT_MS;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withConnectTimeout<T>(
  operation: () => Promise<T>,
  options?: DbConnectOptions,
): Promise<T> {
  if (!options?.force && isDbCircuitOpen()) {
    throw new Error("DATABASE_CIRCUIT_OPEN");
  }

  const timeoutMs = connectTimeoutMs(options);
  const attempts = options?.force ? 2 : 1;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (attempt > 0) await sleep(1_500);

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
    }
  }

  if (!options?.force) openDbCircuit();
  throw lastError;
}
