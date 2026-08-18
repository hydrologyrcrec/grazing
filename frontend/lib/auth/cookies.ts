import type { NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_COOKIE_NAME,
} from "@/lib/auth/constants";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
};

const secure = process.env.NODE_ENV === "production";

const sharedCookieOptions = {
  httpOnly: true,
  secure,
  sameSite: "lax" as const,
  path: "/",
};

export function setAuthCookies(response: NextResponse, tokens: AuthTokens) {
  response.cookies.set(ACCESS_COOKIE_NAME, tokens.accessToken, {
    ...sharedCookieOptions,
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });

  const refreshMaxAge = Math.max(
    0,
    Math.floor((tokens.refreshExpiresAt.getTime() - Date.now()) / 1000),
  );

  response.cookies.set(REFRESH_COOKIE_NAME, tokens.refreshToken, {
    ...sharedCookieOptions,
    maxAge: refreshMaxAge,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE_NAME, "", {
    ...sharedCookieOptions,
    maxAge: 0,
  });
  response.cookies.set(REFRESH_COOKIE_NAME, "", {
    ...sharedCookieOptions,
    maxAge: 0,
  });
}
