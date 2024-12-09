"use client";

import React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

import { cn } from "#/lib/utils";
import { Button } from "#/components/ui/button";
import { Google } from "#/components/icons/google";
import { createClient } from "#/lib/supabase/client";
import { IOSInstructions } from "#/components/ios-instructions";
import { urlBase64ToUint8Array } from "#/services/notifications";

const NUMBER_OF_STEPS = 3;

export function OnboardingSteps() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

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
    if ("serviceWorker" in navigator && "PushManager" in window) {
      registerServiceWorker();
    }

    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
    );

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
      })
      .catch((error) => {
        console.error(error);
      });

    supabase.auth.onAuthStateChange((_, _session) => {
      setSession(_session);
    });
  }, []);

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
        <Button onClick={subscribeToPush}>Activar notificaciones</Button>
      </OnboardingStepsLayout>
    );
  }

  if (!session) {
    return (
      <OnboardingStepsLayout numberOfSteps={NUMBER_OF_STEPS} currentStep={2}>
        <Button onClick={signinWithGoogle}>
          <Google color="#fff" fill="#fff" />
          Entrar con Google
        </Button>
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
