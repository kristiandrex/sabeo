import { NextResponse } from "next/server";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import { createClient } from "#/lib/supabase/server";

const GUEST_COOKIE = "guest-play";

function sanitizePath(path?: string) {
  return path && path.startsWith("/") ? path : "/";
}

function buildRedirect(url: string) {
  const response = NextResponse.redirect(url);
  response.cookies.delete(GUEST_COOKIE);
  return response;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizePath(searchParams.get("next") ?? "/");

  if (!code) {
    return NextResponse.redirect(origin);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(origin);
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) {
    const nextUrl = new URL(next, origin);
    return buildRedirect(nextUrl.toString());
  }

  if (forwardedHost) {
    return buildRedirect(`https://${forwardedHost}${next}`);
  }

  return buildRedirect(`${origin}${next}`);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    event,
    session,
  }: { event: AuthChangeEvent; session: Session | null } = await request.json();

  if (event === "SIGNED_OUT") {
    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
  }

  if (!session || event === "INITIAL_SESSION") {
    return NextResponse.json({ success: true });
  }

  await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  const response = NextResponse.json({ success: true });
  response.cookies.delete(GUEST_COOKIE);
  return response;
}
