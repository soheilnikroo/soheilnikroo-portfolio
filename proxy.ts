import { NextRequest, NextResponse } from "next/server";

import { isSameOriginRequest } from "@/lib/auth/origin";
import { ADMIN_API_PREFIX, isAdminPagePath, isProtectedAdminPath } from "@/lib/auth/paths";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isAdminRequest(request: NextRequest): boolean {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

function withAdminNoIndex(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  const requestWithPath = new NextRequest(request.url, { headers: requestHeaders });

  if (
    pathname.startsWith(ADMIN_API_PREFIX) &&
    MUTATING_METHODS.has(request.method) &&
    pathname !== "/api/admin/login" &&
    !isSameOriginRequest(request)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (isProtectedAdminPath(pathname) && !isAdminRequest(request)) {
    if (pathname.startsWith(ADMIN_API_PREFIX)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const response = NextResponse.next({ request: requestWithPath });

  if (isAdminPagePath(pathname)) {
    withAdminNoIndex(response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|ogg|ico)$).*)",
  ],
};
