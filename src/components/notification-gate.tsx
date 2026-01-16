"use client";

import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { BellIcon } from "lucide-react";

import { createClient } from "#/lib/supabase/client";
import { Button } from "#/components/ui/button";
import {
  detectDevice,
  getExistingSubscription,
  isMobileDevice,
  isStandaloneMode,
  subscribePlayerToNotifications,
  unsubscribeFromNotifications,
  watchStandaloneMode,
  type DeviceInfo,
} from "#/lib/pwa";

import { Loading } from "./loading";
import { InstallInstructions } from "./install-instructions";

type Props = {
  children: ReactNode;
  isAuthenticated: boolean;
};

type LayoutProps = {
  children: ReactNode;
};

function OnboardingLayout({ children }: LayoutProps) {
  return (
    <div className="fixed top-0 left-0 grid h-svh w-screen place-items-center bg-background p-4 text-gray-900 dark:bg-slate-950 dark:text-white sm:p-8">
      <div className="flex h-full w-full items-center justify-center">{children}</div>
    </div>
  );
}

// If value is `null`, it means that the client is not ready yet
type UseDevice = DeviceInfo | null;

const NOTIFICATIONS_SKIP_KEY = "notifications-skip";

export function NotificationGate({ children, isAuthenticated }: Props) {
  const [subscription, setSubscription] = useState<PushSubscription | "loading" | "skipped" | null>(
    "loading",
  );
  const [device, setDevice] = useState<UseDevice>(null);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

  const isMobile = device ? isMobileDevice(device) : false;

  function onSkipNotifications() {
    setShowInstallInstructions(false);
    localStorage.setItem(NOTIFICATIONS_SKIP_KEY, "true");
    setSubscription("skipped");
  }

  async function registerServiceWorker() {
    const sub = await getExistingSubscription();
    setSubscription(sub);
  }

  async function subscribeToNotifications() {
    try {
      const standalone = isStandaloneMode();

      if (standalone) {
        setDevice((prev) => (prev ? { ...prev, isStandalone: true } : detectDevice()));
      }

      if (device && isMobile && !standalone) {
        setShowInstallInstructions(true);
        return;
      }

      setShowInstallInstructions(false);

      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not found");
      }

      const sub = await subscribePlayerToNotifications(user.id);

      localStorage.removeItem(NOTIFICATIONS_SKIP_KEY);
      setSubscription(sub);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo activar las notificaciones");
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const hasSkippedNotifications = localStorage.getItem(NOTIFICATIONS_SKIP_KEY) === "true";

    if (hasSkippedNotifications) {
      setSubscription("skipped");
    }

    const initialDevice = detectDevice();
    setDevice(initialDevice);

    if (initialDevice.isIOS && !initialDevice.isStandalone) {
      setShowInstallInstructions(true);
      setSubscription(null);
    }

    const unsubscribeStandalone = watchStandaloneMode((nextStandalone) => {
      setDevice((prev) =>
        prev
          ? { ...prev, isStandalone: nextStandalone }
          : { ...detectDevice(), isStandalone: nextStandalone },
      );

      if (nextStandalone) {
        setShowInstallInstructions(false);
      }
    });

    let unsubscribeAuth: (() => void) | undefined;

    async function handleLogin() {
      if (hasSkippedNotifications) {
        return;
      }

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setSubscription(null);
        return;
      }

      await registerServiceWorker();
    }

    async function handleLogout() {
      try {
        await unsubscribeFromNotifications();
        setSubscription(null);
      } catch (error) {
        console.error(error);
      }
    }

    async function initialize() {
      try {
        await handleLogin();

        const supabase = createClient();
        const {
          data: { subscription: authSubscription },
        } = supabase.auth.onAuthStateChange(async (_, nextSession) => {
          if (nextSession) {
            await handleLogin();
          } else {
            await handleLogout();
          }
        });
        unsubscribeAuth = () => authSubscription.unsubscribe();
      } catch (error) {
        console.error(error);
        setSubscription(null);
      }
    }

    void initialize();

    return () => {
      unsubscribeStandalone();
      unsubscribeAuth?.();
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return children;
  }

  const isLoading = subscription === "loading" || !device;
  const isNotificationSetupPending = subscription === null;

  if (isLoading) {
    return <Loading />;
  }

  if (showInstallInstructions && device && !device.isStandalone) {
    return (
      <OnboardingLayout>
        <InstallInstructions
          platform={device.isIOS ? "ios" : "android"}
          onSkip={onSkipNotifications}
        />
      </OnboardingLayout>
    );
  }

  if (isNotificationSetupPending) {
    return (
      <OnboardingLayout>
        <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-300">
              <BellIcon className="h-10 w-10" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
                Activa las notificaciones
              </h1>
              <p className="text-pretty text-gray-600 dark:text-gray-300">
                Recibe alertas cuando haya un nuevo desafío disponible
              </p>
            </div>
          </div>

          <div className="flex w-full max-w-sm flex-col gap-2">
            <Button
              className="h-12 bg-green-500 text-base font-semibold text-white hover:bg-green-600"
              onClick={() => void subscribeToNotifications()}
            >
              Activar notificaciones
            </Button>

            <Button
              variant="outline"
              className="h-12 border border-gray-200 text-base font-semibold text-gray-900 transition-colors hover:bg-gray-50 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
              onClick={onSkipNotifications}
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
