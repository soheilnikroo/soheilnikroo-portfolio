export function getClarityProjectId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
  return id || undefined;
}

export function isClarityEnabled(): boolean {
  return process.env.NODE_ENV === "production" && Boolean(getClarityProjectId());
}
