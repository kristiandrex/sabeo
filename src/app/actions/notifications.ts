"use server";

import { createClient } from "#/lib/supabase/server";

export async function getSubscriptionByUser(endpoint: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { subscription: null };
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select()
    .eq("endpoint", endpoint)
    .eq("player", user.id)
    .single();

  if (error) {
    console.error(error);
    return { subscription: null };
  }

  return { subscription: data };
}
