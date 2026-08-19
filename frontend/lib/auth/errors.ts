import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "@/lib/api/errors";

export { ApiError };

export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "Please correct the highlighted values.",
        details: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.status },
    );
  }

  console.error("Unexpected authentication error", error);
  return NextResponse.json(
    { error: "INTERNAL_ERROR", message: "Something went wrong." },
    { status: 500 },
  );
}
