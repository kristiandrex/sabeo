"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

import { Button } from "#/components/ui/button";
import { Google } from "#/components/icons/google";
import { createClient } from "#/lib/supabase/client";
import { OnboardingSteps } from "#/components/onboarding-steps";
import { IOSInstructions } from "#/components/ios-instructions";

const NUMBER_OF_STEPS = 3;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const decoded = window.atob(base64);

  const outputArray = new Uint8Array(decoded.length);

  for (let i = 0; i < decoded.length; i++) {
    outputArray[i] = decoded.charCodeAt(i);
  }

  return outputArray;
}

export default function Home() {
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

  async function handleSendNotification() {
    if (subscription) {
      try {
        const response = await fetch("/api/notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscription),
        });

        if (!response.ok) {
          throw new Error(response.statusText);
        }
      } catch (error) {
        console.error(error);
        toast.error("No se pudo enviar la notificación");
      }
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
      <OnboardingSteps numberOfSteps={NUMBER_OF_STEPS} currentStep={0}>
        <IOSInstructions />
      </OnboardingSteps>
    );
  }

  if (!subscription) {
    return (
      <OnboardingSteps numberOfSteps={NUMBER_OF_STEPS} currentStep={1}>
        <Button onClick={subscribeToPush}>Activar notificaciones</Button>
      </OnboardingSteps>
    );
  }

  if (!session) {
    return (
      <OnboardingSteps numberOfSteps={NUMBER_OF_STEPS} currentStep={2}>
        <Button onClick={signinWithGoogle}>
          <Google color="#fff" fill="#fff" />
          Entrar con Google
        </Button>
      </OnboardingSteps>
    );
  }

  return <Button onClick={handleSendNotification}>Enviar notificación</Button>;
}
