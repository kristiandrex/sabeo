"use client";

import { createClient } from "#/lib/supabase/client";

function normalizeRedirectPath(path?: string) {
  if (!path || !path.startsWith("/")) {
    return "/play";
  }

  return path;
}

function getRedirectBaseUrl() {
  // Copied from https://supabase.com/docs/guides/auth/redirect-urls#vercel-preview-urls
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ??
    process?.env?.NEXT_PUBLIC_VERCEL_URL ??
    "https://localhost:3000/";

  url = url.startsWith("http") ? url : `https://${url}`;
  url = url.endsWith("/") ? url : `${url}/`;

  return url;
}

export async function signInWithGoogle(nextPath?: string) {
  const supabase = createClient();
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
