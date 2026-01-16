import { NextRequest } from "next/server";
import webpush from "web-push";

import { createClient } from "#/lib/supabase/server";

webpush.setVapidDetails(
  "mailto:cristiandrestorres@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const sub = await req.json();

    const result = await supabase.from("subscriptions").insert(sub);

    if (result.error) {
      console.error(result.error);

      return new Response(result.statusText, { status: result.status });
    }

    await webpush.sendNotification(
      sub,
      JSON.stringify({
        title: "Sabeo",
        body: "Recibirás una notificación cuando haya un nuevo reto",
        icon: "/icon-512x512.png",
      }),
    );

    return new Response("Subscription created", { status: 201 });
  } catch (error) {
    console.error(error);

    return new Response("An error occurred while creating the subscription", {
      status: 500,
    });
  }
}
