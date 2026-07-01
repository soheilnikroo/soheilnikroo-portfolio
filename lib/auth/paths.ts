export const ADMIN_PAGE_PREFIX = "/admin";
export const ADMIN_API_PREFIX = "/api/admin";
export const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/api/admin/login"]);

export function isProtectedAdminPath(pathname: string): boolean {
  if (PUBLIC_ADMIN_PATHS.has(pathname)) return false;
  if (pathname === ADMIN_PAGE_PREFIX || pathname.startsWith(`${ADMIN_PAGE_PREFIX}/`)) return true;
  if (pathname === ADMIN_API_PREFIX || pathname.startsWith(`${ADMIN_API_PREFIX}/`)) return true;
  return false;
}

export function isAdminPagePath(pathname: string): boolean {
  return pathname === ADMIN_PAGE_PREFIX || pathname.startsWith(`${ADMIN_PAGE_PREFIX}/`);
}

export function safeAdminRedirectPath(next: string | null): string {
  if (!next || !next.startsWith("/admin") || next.startsWith("/admin/login")) return "/admin";
  return next;
}
