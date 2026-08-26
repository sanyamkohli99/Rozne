import { NextResponse } from "next/server";
import { ZodError } from "zod";

type ErrorWithStatus = { status?: number; message?: string };

/**
 * Shared API error handler: maps thrown errors to consistent JSON responses.
 * Usage: wrap route handler bodies in try/catch and `return handleApiError(err)`.
 */
export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid request data.", details: err.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const maybe = err as ErrorWithStatus | null;
  const status =
    typeof maybe?.status === "number" && maybe.status >= 400 && maybe.status < 600
      ? maybe.status
      : 500;

  // Log unexpected server errors only.
  if (status >= 500) {
    console.error("[api:error]", err);
  }

  return NextResponse.json(
    { error: maybe?.message || "Something went wrong." },
    { status },
  );
}
