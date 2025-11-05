"use client";

import { Button } from "@radix-ui/themes";
import type { Session } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { createClient } from "#/lib/supabase/client";
import { urlBase64ToUint8Array } from "#/utils/notifications";

import { Loading } from "./loading";
import { InstallInstructions } from "./install-instructions";
import { EllipsisVerticalIcon, ShareIcon } from "lucide-react";
import { OnboardingStepsLayout } from "./onboarding-steps-layout";

type Props = {
  children: React.ReactNode;
};

// If value is `null`, it means that the client is not ready yet
type UseDevice = {
  isIOS: boolean;
  isAndroid: boolean;
  isStandalone: boolean;
} | null;

const NOTIFICATIONS_SKIP_KEY = "notifications-skip";

export function OnboardingSteps({ children }: Props) {
  const router = useRouter();
  const [subscription, setSubscription] = useState<
    PushSubscription | "loading" | "skipped" | null
  >("loading");

  const [device, setDevice] = useState<UseDevice>(null);
  const [session, setSession] = useState<Session | "loading" | null>("loading");

  const isMobile = device?.isIOS || device?.isAndroid;
  const numberOfSteps = isMobile ? 3 : 2;

  function handleSkipNotifications() {
    localStorage.setItem(NOTIFICATIONS_SKIP_KEY, "true");
    setSubscription("skipped");
    router.replace("/play");
  }

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });

    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });

      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not found");
      }

      const json = sub.toJSON();

      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...json,
          player: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      localStorage.removeItem(NOTIFICATIONS_SKIP_KEY);
      setSubscription(sub);
      router.replace("/play");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo activar las notificaciones");
    }
  }

  async function signinWithGoogle() {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          process.env.NEXT_PUBLIC_VERCEL_ENV !== "production"
            ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/auth/callback`
            : `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/api/auth/callback`,
      },
    });
  }

  useEffect(() => {
    const hasSkippedNotifications =
      localStorage.getItem(NOTIFICATIONS_SKIP_KEY) === "true";

    if (hasSkippedNotifications) {
      setSubscription("skipped");
    }

    setDevice({
      isIOS:
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window),
      isAndroid: /Android/.test(navigator.userAgent),
      isStandalone: window.matchMedia("(display-mode: standalone)").matches,
    });

    async function initialize() {
      try {
        if (
          !hasSkippedNotifications &&
          "serviceWorker" in navigator &&
          "PushManager" in window
        ) {
          await registerServiceWorker();
        }

        const supabase = createClient();
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        setSession(data.session);

        supabase.auth.onAuthStateChange((_, _session) => {
          setSession(_session);
        });
      } catch (error) {
        console.error(error);
      }
    }

    initialize();
  }, []);

  const isLoading =
    session === "loading" || subscription === "loading" || !device;

  if (isLoading) {
    return <Loading />;
  }

  if (isMobile && !device.isStandalone) {
    return (
      <OnboardingStepsLayout numberOfSteps={numberOfSteps} currentStep={0}>
        <InstallInstructions
          icon={
            device.isIOS ? (
              <ShareIcon className="inline-block" />
            ) : (
              <EllipsisVerticalIcon className="inline-block" />
            )
          }
        />
      </OnboardingStepsLayout>
    );
  }

  if (!session) {
    return (
      <OnboardingStepsLayout
        numberOfSteps={numberOfSteps}
        currentStep={isMobile ? 1 : 0}
      >
        <div className="flex flex-col gap-4 items-center">
          <p className="text-center text-pretty">
            Inicia sesión con tu cuenta de Google para guardar tu progreso
          </p>

          <Button
            className="bg-green-500 hover:bg-green-600"
            onClick={signinWithGoogle}
          >
            Entrar con Google
          </Button>
        </div>
      </OnboardingStepsLayout>
    );
  }

  if (!subscription) {
    return (
      <OnboardingStepsLayout
        numberOfSteps={numberOfSteps}
        currentStep={isMobile ? 2 : 1}
      >
        <div className="flex flex-col gap-4 items-center">
          <p className="text-center text-pretty">
            Activa las notificaciones para avisarte cuando haya un nuevo reto
          </p>

          <div className="flex flex-col gap-2">
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={subscribeToPush}
            >
              Activar notificaciones
            </Button>

            <Button variant="outline" onClick={handleSkipNotifications}>
              Omitir
            </Button>
          </div>
        </div>
      </OnboardingStepsLayout>
    );
  }

  return children;
}
