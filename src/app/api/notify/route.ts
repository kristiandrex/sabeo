import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import webpush from "web-push";

import { createServiceClient } from "#/lib/supabase/server";

webpush.setVapidDetails(
  "mailto:cristiandrestorres@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  console.log(req);

  try {
    const requestHeaders = new Headers(req.headers);

    if (
      requestHeaders.get("api-key") !== process.env.NOTIFICATIONS_PRIVATE_KEY
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, playerId } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    const query = supabase.from("subscriptions").select("*");

    if (playerId) {
      query.eq("player", playerId);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      console.error("Error fetching subscriptions:", error);

      return NextResponse.json(
        { error: "Error fetching subscriptions" },
        { status: 500 }
      );
    }

    if (!subscriptions.length) {
      return NextResponse.json(
        { error: "No subscriptions found" },
        { status: 404 }
      );
    }

    const promises = subscriptions.map((subscription) => {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      };

      return webpush
        .sendNotification(
          pushSubscription,
          JSON.stringify({
            title,
            body: description,
            icon: "/icon-512x512.png",
          })
        )
        .catch((error) => console.error("Notification error:", error));
    });

    waitUntil(Promise.allSettled(promises));

    return NextResponse.json(
      {
        message: `Sending notifications to ${subscriptions.length} recipients`,
        total: subscriptions.length,
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Error sending notifications:", error);

    return NextResponse.json(
      { error: "An error occurred while sending notifications" },
      {
        status: 500,
      }
    );
  }
}
