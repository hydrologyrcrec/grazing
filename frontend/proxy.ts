import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-grazing_access"
    : "grazing_access";

const REFRESH_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-grazing_refresh"
    : "grazing_refresh";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasAccessToken = request.cookies.has(ACCESS_COOKIE_NAME);
  const hasRefreshToken = request.cookies.has(REFRESH_COOKIE_NAME);
  const hasPossibleSession = hasAccessToken || hasRefreshToken;

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isProtectedPage = pathname.startsWith("/home");

  // A signed-in user who manually opens /login or /signup goes back to /home.
  if (isAuthPage && hasPossibleSession) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // No tokens at all means the user is definitely unauthenticated.
  if (isProtectedPage && !hasPossibleSession) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/form/:path*", "/login", "/signup"],
};
