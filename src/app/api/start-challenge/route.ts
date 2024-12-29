import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { waitUntil } from "@vercel/functions";
import { type NextRequest } from "next/server";
import webpush, { PushSubscription } from "web-push";

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

    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .select("*")
      .is("started_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    // No challenge available
    if (challengeError?.code === "PGRST116") {
      return new Response("No challenge available", { status: 404 });
    }

    if (challengeError) {
      console.error(challengeError);
      return new Response("An error occurred while fetching the challenge", {
        status: 500,
      });
    }

    if (challenge) {
      const { error: updateError } = await supabase
        .from("challenges")
        .update({ started_at: new Date().toISOString() })
        .eq("id", challenge.id);

      if (updateError) {
        console.error(updateError);
        return new Response("An error occurred while updating the challenge", {
          status: 500,
        });
      }
    }

    const { data, error }: PostgrestSingleResponse<PushSubscription[]> =
      await supabase.from("subscriptions").select("*");

    if (error) {
      console.error(error);

      return new Response("An error ocurred while fetching subscriptions", {
        status: 500,
      });
    }

    const promises = data.map((sub) =>
      webpush
        .sendNotification(
          sub,
          JSON.stringify({
            title: "Sabeo",
            body: "¡Hay un nuevo reto!",
            icon: "/icon-512x512.png",
          })
        )
        .catch((error) => console.error(error))
    );

    waitUntil(Promise.allSettled(promises));

    console.log("Notifications sent");
    return new Response("Notifications sent", { status: 200 });
  } catch (error) {
    console.error(error);

    return new Response("An error occurred while sending notifications", {
      status: 500,
    });
  }
}
