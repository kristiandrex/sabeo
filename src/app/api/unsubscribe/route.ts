import { NextRequest } from "next/server";

import { createClient } from "#/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { endpoint } = await req.json();

    if (!endpoint) {
      return new Response("Missing subscription endpoint", { status: 400 });
    }

    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("endpoint", endpoint);

    if (error) {
      console.error(error);

      return new Response("Unable to delete subscription", {
        status: error.code === "PGRST116" ? 404 : 500,
      });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);

    return new Response("Unexpected error while deleting subscription", {
      status: 500,
    });
  }
}
