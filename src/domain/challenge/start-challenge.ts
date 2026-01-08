import { PostgrestSingleResponse } from "@supabase/supabase-js";
import webpush, { PushSubscription, SendResult } from "web-push";

import { createServiceClient } from "#/lib/supabase/server";

webpush.setVapidDetails(
  "mailto:cristiandrestorres@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

type StartChallengeSuccess = {
  status: "success";
  message: string;
  challengeId: number;
  notifications: Promise<PromiseSettledResult<SendResult>[]>;
};

type StartChallengeNotFound = {
  status: "not_found";
  message: string;
};

type StartChallengeError = {
  status: "error";
  message: string;
};

export type StartChallengeResult =
  | StartChallengeSuccess
  | StartChallengeNotFound
  | StartChallengeError;

export async function startChallenge(): Promise<StartChallengeResult> {
  const supabase = await createServiceClient();

  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select("*")
    .is("started_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (challengeError?.code === "PGRST116") {
    return {
      status: "not_found",
      message: "No challenge available",
    };
  }

  if (challengeError) {
    console.error("Failed to fetch challenge", challengeError);
    return {
      status: "error",
      message: "An error occurred while fetching the challenge",
    };
  }

  const { error: updateError } = await supabase
    .from("challenges")
    .update({ started_at: new Date().toISOString() })
    .eq("id", challenge.id);

  if (updateError) {
    console.error("Failed to update challenge", updateError);
    return {
      status: "error",
      message: "An error occurred while updating the challenge",
    };
  }

  const { data, error }: PostgrestSingleResponse<PushSubscription[]> =
    await supabase.from("subscriptions").select("*");

  if (error) {
    console.error("Failed to fetch subscriptions", error);
    return {
      status: "error",
      message: "An error occurred while fetching subscriptions",
    };
  }

  const notifications = Promise.allSettled(
    data.map((sub) =>
      webpush
        .sendNotification(
          sub,
          JSON.stringify({
            title: "Sabeo",
            body: "¡Hay un nuevo reto!",
            icon: "/icon-512x512.png",
          }),
        )
        .catch((error) => {
          console.error(error);
          return Promise.reject(error);
        }),
    ),
  );

  return {
    status: "success",
    message: "Notifications sent",
    challengeId: challenge.id,
    notifications: notifications,
  };
}
