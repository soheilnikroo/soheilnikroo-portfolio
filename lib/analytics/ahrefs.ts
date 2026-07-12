export function getAhrefsDataKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_AHREFS_DATA_KEY?.trim();
  return key || undefined;
}

export function isAhrefsEnabled(): boolean {
  return process.env.NODE_ENV === "production" && Boolean(getAhrefsDataKey());
}
