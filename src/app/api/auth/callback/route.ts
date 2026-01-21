import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import { GUEST_COOKIE } from "#/constants";
import { createClient } from "#/lib/supabase/server";

function sanitizePath(path?: string) {
  return path && path.startsWith("/") ? path : "/";
}

type CookiePayload = { name: string; value: string; options?: Record<string, unknown> };

function buildRedirect(url: string, cookiesToSet: CookiePayload[]) {
  const response = NextResponse.redirect(url);
  cookiesToSet.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options as never),
  );
  response.cookies.delete(GUEST_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizePath(searchParams.get("next") ?? "/");

  if (!code) {
    return NextResponse.redirect(origin);
  }

  let cookiesToSet: CookiePayload[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(newCookies) {
          cookiesToSet = newCookies;
          newCookies.forEach(({ name, value }) => request.cookies.set(name, value));
        },
      },
    },
  );
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(origin);
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) {
    const nextUrl = new URL(next, origin);
    return buildRedirect(nextUrl.toString(), cookiesToSet);
  }

  if (forwardedHost) {
    return buildRedirect(`https://${forwardedHost}${next}`, cookiesToSet);
  }

  return buildRedirect(`${origin}${next}`, cookiesToSet);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { event, session }: { event: AuthChangeEvent; session: Session | null } =
    await request.json();

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
