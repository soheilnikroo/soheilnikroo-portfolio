import { headers } from "next/headers";

import { isAdminPagePath } from "@/lib/auth/paths";

import type { DbConnectOptions } from "./resilience";

export async function isAdminPageRequest(): Promise<boolean> {
  try {
    const pathname = (await headers()).get("x-pathname");
    return pathname ? isAdminPagePath(pathname) : false;
  } catch {
    return false;
  }
}

export function isContentStoreEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** CMS reads always try the live database when configured. */
export async function resolveDbConnectOptions(
  options?: DbConnectOptions,
): Promise<DbConnectOptions> {
  const base = options ?? {};
  if (base.quick || base.force || base.preferLive) return base;
  if (isContentStoreEnabled()) return { ...base, preferLive: true };
  return base;
}

export function isNextProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}
