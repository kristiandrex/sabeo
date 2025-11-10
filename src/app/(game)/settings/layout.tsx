import { redirect } from "next/navigation";

import { createClient } from "#/lib/supabase/server";

type Props = {
  children: React.ReactNode;
};

export default async function SettingsLayout({ children }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return children;
}
