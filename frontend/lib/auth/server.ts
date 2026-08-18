import { cookies } from "next/headers";
import { ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { ApiError } from "@/lib/auth/errors";
import { getActiveUser } from "@/lib/auth/auth-service";
import { verifyAccessToken } from "@/lib/auth/tokens";

// Use in protected API route handlers. It deliberately does not refresh tokens;
// the browser apiFetch helper performs a single background refresh and retries.
export async function requireActiveUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    throw new ApiError(401, "ACCESS_MISSING", "Authentication is required.");
  }

  try {
    const claims = await verifyAccessToken(accessToken);
    return getActiveUser(claims.userId);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, "ACCESS_EXPIRED", "Access token has expired.");
  }
}
