import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth/cookies";
import { errorResponse } from "@/lib/auth/errors";
import { registerUser } from "@/lib/auth/auth-service";
import { signUpSchema } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = signUpSchema.parse(await request.json());
    const result = await registerUser(input);
    const response = NextResponse.json({ user: result.user }, { status: 201 });
    setAuthCookies(response, result);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
