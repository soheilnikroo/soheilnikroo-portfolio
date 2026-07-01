/** Server-side only — never surface connection details to clients or production logs. */
export function logContentStoreError(scope: string, error: unknown): void {
  if (process.env.NODE_ENV === "production") {
    console.warn(`[${scope}] content store unavailable`);
    return;
  }
  const detail = error instanceof Error ? error.message : error;
  console.warn(`[${scope}] content store unavailable`, detail);
}
