"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const GUEST_COOKIE = "guest-play";

export async function setGuestMode() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: GUEST_COOKIE,
    value: "1",
    path: "/",
    // Let the preference persist for ~30 days; can be adjusted later.
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/play");
}
