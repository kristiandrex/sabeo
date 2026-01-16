import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GUEST_COOKIE } from "#/constants";
import { createClient } from "#/lib/supabase/server";
import { LoginScreen } from "#/components/login-screen";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const hasGuestPreference = cookieStore.get(GUEST_COOKIE)?.value === "1";
  const isAuthenticated = Boolean(user);

  if (isAuthenticated || hasGuestPreference) {
    redirect("/play");
  }

  return <LoginScreen />;
}
