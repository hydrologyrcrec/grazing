import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "Please correct the submitted values.",
        details: error.flatten().fieldErrors,
      },
      {
        status: 400,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      {
        status: error.status,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }

  console.error("Unexpected API error", error);

  return NextResponse.json(
    { error: "INTERNAL_ERROR", message: "Something went wrong." },
    {
      status: 500,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
