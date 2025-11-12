"use client";

import { createClient } from "#/lib/supabase/client";

function normalizeRedirectPath(path?: string) {
  if (!path || !path.startsWith("/")) {
    return "/play";
  }

  return path;
}

export async function signInWithGoogle(nextPath?: string) {
  const supabase = createClient();

  function getRedirectBaseUrl() {
    const env = process.env.NEXT_PUBLIC_VERCEL_ENV;

    if (env === "production") {
      return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;
    }

    if (env === "preview" && process.env.NEXT_PUBLIC_VERCEL_URL) {
      return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    }

    if (typeof window !== "undefined") {
      return window.location.origin;
    }

    return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  }

  const redirectBaseUrl = getRedirectBaseUrl();
  const redirectUrl = new URL("/api/auth/callback", redirectBaseUrl);
  redirectUrl.searchParams.set("next", normalizeRedirectPath(nextPath));
  const redirectTo = redirectUrl.toString();

  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });
}
