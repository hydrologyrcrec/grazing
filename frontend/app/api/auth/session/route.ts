import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth/constants";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { errorResponse, ApiError } from "@/lib/auth/errors";
import { getActiveUser, rotateRefreshSession } from "@/lib/auth/auth-service";
import { verifyAccessToken } from "@/lib/auth/tokens";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

    if (accessToken) {
      try {
        const claims = await verifyAccessToken(accessToken);
        const user = await getActiveUser(claims.userId);
        return NextResponse.json({ user });
      } catch {
        // A refresh token below may replace an expired or otherwise invalid access token.
      }
    }

    const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
    if (!refreshToken) {
      throw new ApiError(401, "SESSION_EXPIRED", "Your session has expired. Please sign in again.");
    }

    const result = await rotateRefreshSession(refreshToken);
    const response = NextResponse.json({ user: result.user });
    setAuthCookies(response, result);
    return response;
  } catch (error) {
    const response = errorResponse(error);
    clearAuthCookies(response);
    return response;
  }
}
