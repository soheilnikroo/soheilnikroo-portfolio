import { headers } from "next/headers";

import { ADMIN_API_PREFIX, isAdminPagePath } from "@/lib/auth/paths";
import { isAdmin } from "@/lib/auth/session";

import type { DbConnectOptions } from "./resilience";

export async function isAdminPageRequest(): Promise<boolean> {
  try {
    const pathname = (await headers()).get("x-pathname");
    return pathname ? isAdminPagePath(pathname) : false;
  } catch {
    return false;
  }
}

export async function isAdminContentRequest(): Promise<boolean> {
  if (await isAdmin()) return true;
  try {
    const pathname = (await headers()).get("x-pathname");
    if (!pathname) return false;
    return isAdminPagePath(pathname) || pathname.startsWith(ADMIN_API_PREFIX);
  } catch {
    return false;
  }
}

export function isContentStoreEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Public reads fail fast to fallbacks; authenticated admin reads wait for live CMS data. */
export async function resolveDbConnectOptions(
  options?: DbConnectOptions,
): Promise<DbConnectOptions> {
  const base = options ?? {};
  if (base.quick || base.force || base.preferLive || base.fastFail) return base;
  if (await isAdminContentRequest()) return { ...base, force: true };
  if (isContentStoreEnabled()) return { ...base, fastFail: true };
  return base;
}

export function isNextProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}
