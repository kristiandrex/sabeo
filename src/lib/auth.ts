"use client";

import { createClient } from "#/lib/supabase/client";

function normalizeRedirectPath(path?: string) {
  if (!path || !path.startsWith("/")) {
    return "/play";
  }

  return path;
}

function getRedirectBaseUrl() {
  let url = window.location.origin;
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
