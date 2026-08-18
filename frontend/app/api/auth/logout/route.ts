import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { REFRESH_COOKIE_NAME } from "@/lib/auth/constants";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { revokeRefreshSession } from "@/lib/auth/auth-service";

export const runtime = "nodejs";

export async function POST() {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE_NAME)?.value;
  if (refreshToken) await revokeRefreshSession(refreshToken);

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
