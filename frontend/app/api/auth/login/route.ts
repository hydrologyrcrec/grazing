import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth/cookies";
import { errorResponse } from "@/lib/auth/errors";
import { loginUser } from "@/lib/auth/auth-service";
import { loginSchema } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const result = await loginUser(input);
    const response = NextResponse.json({ user: result.user });
    setAuthCookies(response, result);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
