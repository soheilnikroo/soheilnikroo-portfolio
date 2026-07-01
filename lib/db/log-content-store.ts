import { isNextProductionBuild } from "./request-context";

const LOG_COOLDOWN_MS = 60_000;
const recentLogs = new Map<string, number>();

/** Server-side only — never surface connection details to clients or production logs. */
export function logContentStoreError(scope: string, error: unknown): void {
  if (isNextProductionBuild()) return;

  const now = Date.now();
  const last = recentLogs.get(scope) ?? 0;
  if (now - last < LOG_COOLDOWN_MS) return;
  recentLogs.set(scope, now);

  if (process.env.NODE_ENV === "production") {
    console.warn(`[${scope}] content store unavailable`);
    return;
  }
  const detail = error instanceof Error ? error.message : error;
  console.warn(`[${scope}] content store unavailable`, detail);
}
