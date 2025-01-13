"use client";

import { Button } from "@radix-ui/themes";
import type { Session } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { createClient } from "#/lib/supabase/client";
import { cn } from "#/lib/utils";
import { urlBase64ToUint8Array } from "#/utils/notifications";
import { getSubscriptionByUser } from "#/app/actions/notifications";

import { AndroidInstructions } from "./android-instructions";
import { IOSInstructions } from "./ios-instructions";
import { Loading } from "./loading";

type Props = {
  children: React.ReactNode;
};

export function OnboardingSteps({ children }: Props) {
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const isMobile = isIOS || isAndroid;
  const numberOfSteps = isMobile ? 3 : 2;

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });

    const sub = await registration.pushManager.getSubscription();

    if (!sub) {
      return;
    }

    const { subscription: storedSubscription } = await getSubscriptionByUser(
      sub.endpoint
    );

    if (storedSubscription) {
      setSubscription(sub);
    }
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
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

      setSubscription(sub);
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
          process.env.VERCEL_ENV !== "production"
            ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/auth/callback`
            : `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/auth/callback`,
      },
    });
  }

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
    );

    setIsAndroid(/Android/.test(navigator.userAgent));

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    async function initialize() {
      try {
        if ("serviceWorker" in navigator && "PushManager" in window) {
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
          setLoading(false);
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (isIOS && !isStandalone) {
    return (
      <OnboardingStepsLayout numberOfSteps={numberOfSteps} currentStep={0}>
        <IOSInstructions />
      </OnboardingStepsLayout>
    );
  }

  if (isAndroid && !isStandalone) {
    return (
      <OnboardingStepsLayout numberOfSteps={numberOfSteps} currentStep={0}>
        <AndroidInstructions />
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
          <Button
            className="bg-green-500 hover:bg-green-600"
            onClick={subscribeToPush}
          >
            Activar notificaciones
          </Button>
        </div>
      </OnboardingStepsLayout>
    );
  }

  return children;
}

function OnboardingStepsLayout(props: {
  children: React.ReactNode;

  /**
   * The total number of steps
   */
  numberOfSteps: number;

  /**
   * The current step starting from 0
   */
  currentStep: number;
}) {
  const dots: React.ReactNode[] = [];

  for (let i = 0; i < props.numberOfSteps; i++) {
    dots.push(
      <div
        key={i}
        className={cn(
          "w-3 h-3 rounded-full bg-gray-300",
          i === props.currentStep && "bg-gray-400"
        )}
      ></div>
    );
  }

  return (
    <div className="fixed top-0 left-0 h-svh w-screen bg-white grid place-items-center p-8">
      <div className="grid grid-rows-[1fr_auto] h-full">
        <div className="h-full grid place-items-center">{props.children}</div>
        <div className="flex gap-2 justify-center items-center">{dots}</div>
      </div>
    </div>
  );
}
