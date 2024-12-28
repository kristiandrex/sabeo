import { PostgrestSingleResponse } from "@supabase/supabase-js";
import webpush, { PushSubscription } from "web-push";
import { type NextRequest } from "next/server";

import { createServiceClient } from "#/lib/supabase/server";

webpush.setVapidDetails(
  "mailto:cristiandrestorres@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const requestHeaders = new Headers(req.headers);

    if (
      requestHeaders.get("api-key") !== process.env.NOTIFICATIONS_PRIVATE_KEY
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    const supabase = await createServiceClient();

    const { data, error }: PostgrestSingleResponse<PushSubscription[]> =
      await supabase.from("subscriptions").select("*");

    if (error) {
      console.error(error);

      return new Response("An error ocurred while fetching subscriptions", {
        status: 500,
      });
    }

    for (const sub of data) {
      webpush
        .sendNotification(
          sub,
          JSON.stringify({
            title: "Sabeo",
            body: "¡Hay un nuevo reto!",
            icon: "/icon-512x512.png",
          })
        )
        .catch((error) => console.error(error));
    }

    console.log("Notifications sent");
    return new Response("Notifications sent", { status: 200 });
  } catch (error) {
    console.error(error);

    return new Response("An error occurred while sending notifications", {
      status: 500,
    });
  }
}
