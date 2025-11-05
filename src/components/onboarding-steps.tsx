"use client";

import { Button } from "@radix-ui/themes";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { createClient } from "#/lib/supabase/client";
import { urlBase64ToUint8Array } from "#/utils/notifications";

import { Loading } from "./loading";
import { InstallInstructions } from "./install-instructions";
import { BellIcon, TrophyIcon } from "lucide-react";

type Props = {
  children: ReactNode;
};

type LayoutProps = {
  children: ReactNode;
};

function OnboardingLayout({ children }: LayoutProps) {
  return (
    <div className="fixed top-0 left-0 grid h-svh w-screen place-items-center bg-white p-8">
      <div className="flex h-full w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}

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
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

  const isMobile = device?.isIOS || device?.isAndroid;

  function handleSkipNotifications() {
    setShowInstallInstructions(false);
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
      if (device && isMobile && !device.isStandalone) {
        setShowInstallInstructions(true);
        return;
      }

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
  const isAuthenticated = session !== "loading" && session !== null;
  const isNotificationSetupPending = subscription === null;

  if (isLoading) {
    return <Loading />;
  }

  if (showInstallInstructions && device) {
    return (
      <OnboardingLayout>
        <InstallInstructions
          platform={device.isIOS ? "ios" : "android"}
          onSkip={handleSkipNotifications}
        />
      </OnboardingLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <OnboardingLayout>
        <div className="flex w-full max-w-sm flex-col items-center gap-10 text-center">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-4xl font-semibold tracking-tight">
              Bienvenido a Sabeo
            </h1>
            <p className="text-base text-gray-600 text-pretty">
              Descubre la palabra del día
            </p>
          </div>

          <div className="w-full rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_18px_40px_rgba(24,94,32,0.08)]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600 shadow-inner">
                <TrophyIcon className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-lg font-semibold">Compite en el ranking</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Participa en la clasificación diaria y general
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-4">
            <Button
              className="h-12 w-full bg-green-600 text-base font-semibold text-white hover:bg-green-700"
              onClick={signinWithGoogle}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="white"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="white"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="white"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="white"
                />
              </svg>
              Continuar con Google
            </Button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  if (isNotificationSetupPending) {
    return (
      <OnboardingLayout>
        <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100 text-green-600">
              <BellIcon className="h-10 w-10" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold">
                Activa las notificaciones
              </h1>
              <p className="text-gray-600 text-pretty">
                Recibe alertas cuando haya un nuevo desafío disponible
              </p>
            </div>
          </div>

          <div className="flex w-full max-w-sm flex-col gap-2">
            <Button
              className="h-12 bg-green-500 text-base font-semibold hover:bg-green-600"
              onClick={subscribeToPush}
            >
              Activar notificaciones
            </Button>

            <Button
              variant="outline"
              className="h-12 text-base font-semibold"
              onClick={handleSkipNotifications}
            >
              Continuar sin notificaciones
            </Button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  return children;
}
