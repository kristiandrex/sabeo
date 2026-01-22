"use client";

import { createClient } from "#/lib/supabase/client";

function normalizeRedirectPath(path?: string) {
  if (!path || !path.startsWith("/")) {
    return "/play";
  }

  return path;
}

function getRedirectBaseUrl() {
  // Read https://vercel.com/docs/environment-variables/framework-environment-variables#NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
  let url =
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
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

  console.log({
    redirectTo,
  });

  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });
}
