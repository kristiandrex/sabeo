import { redirect } from "next/navigation";

import { createClient } from "#/lib/supabase/server";
import { Loading } from "#/components/loading";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    redirect("/play");
  }

  return <Loading />;
}
