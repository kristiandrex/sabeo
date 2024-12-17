"use client";

import React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@radix-ui/themes";

import { cn } from "#/lib/utils";
import { createClient } from "#/lib/supabase/client";
import { IOSInstructions } from "#/components/ios-instructions";
import { urlBase64ToUint8Array } from "#/utils/notifications";

const NUMBER_OF_STEPS = 3;

export function OnboardingSteps() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sub),
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

    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL,
      },
    });
  }

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
    );

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    async function initialize() {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        await registerServiceWorker();
      }

      const supabase = createClient();

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        setSession(data.session);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }

      supabase.auth.onAuthStateChange((_, _session) => {
        setSession(_session);
        setLoading(false);
      });
    }

    initialize();
  }, []);

  if (loading) {
    return (
      <div className="fixed h-dvh w-screen bg-white grid place-items-center">
        <p className="text-2xl text-center">Cargando...</p>
      </div>
    );
  }

  if (isIOS && !isStandalone) {
    return (
      <OnboardingStepsLayout numberOfSteps={NUMBER_OF_STEPS} currentStep={0}>
        <IOSInstructions />
      </OnboardingStepsLayout>
    );
  }

  if (!subscription) {
    return (
      <OnboardingStepsLayout numberOfSteps={NUMBER_OF_STEPS} currentStep={1}>
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

  if (!session) {
    return (
      <OnboardingStepsLayout numberOfSteps={NUMBER_OF_STEPS} currentStep={2}>
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

  return null;
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
          i === props.currentStep && "bg-primary"
        )}
      ></div>
    );
  }

  return (
    <div className="fixed h-screen w-screen bg-white grid place-items-center p-8">
      <div className="grid grid-rows-[1fr_auto] h-full">
        <div className="h-full grid place-items-center">{props.children}</div>
        <div className="flex gap-2 justify-center">{dots}</div>
      </div>
    </div>
  );
}
