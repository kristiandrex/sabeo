import { type NextRequest, NextResponse } from "next/server";

import { updateSession } from "#/lib/supabase/middleware";

const EXCLUDED_PATHS = [
  "/_next/static",
  "/_next/image",
  "/favicon.ico",
  "/manifest.webmanifest",
  "/sw.js",
  "/api/auth/callback",
  "/api/start-challenge",
  "/api/schedule-daily-challenge",
];

const EXCLUDED_EXTENSIONS = [".png"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    EXCLUDED_PATHS.some((path) => pathname.startsWith(path)) ||
    EXCLUDED_EXTENSIONS.some((ext) => pathname.endsWith(ext))
  ) {
    return NextResponse.next();
  }

  return await updateSession(request);
}
