import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { REFRESH_COOKIE_NAME } from "@/lib/auth/constants";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { errorResponse, ApiError } from "@/lib/auth/errors";
import { rotateRefreshSession } from "@/lib/auth/auth-service";

export const runtime = "nodejs";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
    if (!refreshToken) {
      throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Your session has expired. Please sign in again.");
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
