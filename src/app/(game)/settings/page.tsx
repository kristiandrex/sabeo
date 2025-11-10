"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, BellIcon } from "lucide-react";
import { toast } from "sonner";

import { InstallInstructions } from "#/components/install-instructions";
import { Switch } from "#/components/ui/switch";
import { createClient } from "#/lib/supabase/client";
import {
  detectDevice,
  getExistingSubscription,
  isMobileDevice,
  subscribePlayerToNotifications,
  unsubscribeFromNotifications,
  watchStandaloneMode,
  type DeviceInfo,
} from "#/utils/pwa";

type Status = "idle" | "subscribed" | "processing" | "unsupported";

export default function SettingsRoute() {
  const router = useRouter();
  const [device, setDevice] = useState<DeviceInfo>(() => detectDevice());
  const [status, setStatus] = useState<Status>("idle");
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

  const canToggle = status !== "unsupported" && permission !== "denied";

  useEffect(() => {
    const unsubscribe = watchStandaloneMode((isStandalone) => {
      setDevice((prev) => ({ ...prev, isStandalone }));
      if (isStandalone) {
        setShowInstallInstructions(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      if (
        typeof window === "undefined" ||
        !("Notification" in window) ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        if (active) {
          setStatus("unsupported");
        }
        return;
      }

      try {
        const subscription = await getExistingSubscription();
        const currentPermission = Notification.permission;

        if (active) {
          setPermission(currentPermission);
          setStatus(
            subscription && currentPermission === "granted"
              ? "subscribed"
              : "idle",
          );
        }
      } catch (error) {
        console.error(error);
        if (active) {
          toast.error("Hubo un problema al cargar la configuración");
        }
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, []);

  async function enableNotifications() {
    if (isMobileDevice(device) && !device.isStandalone) {
      setShowInstallInstructions(true);
      return;
    }

    setStatus("processing");

    try {
      const permissionResult =
        permission === "granted"
          ? "granted"
          : await Notification.requestPermission();

      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        toast.error("Debes permitir las notificaciones");
        setStatus("idle");
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        throw error || new Error("No se encontró el usuario");
      }

      await subscribePlayerToNotifications(user.id);
      setStatus("subscribed");
      toast.success("Notificaciones activadas");
    } catch (error) {
      console.error(error);
      setStatus("idle");
      toast.error("No se pudo activar las notificaciones");
    }
  }

  async function disableNotifications() {
    setStatus("processing");

    try {
      await unsubscribeFromNotifications();
      setStatus("idle");
      toast.success("Notificaciones desactivadas");
    } catch (error) {
      console.error(error);
      setStatus("subscribed");
      toast.error("No se pudo desactivar las notificaciones");
    }
  }

  async function handleToggleChange(checked: boolean) {
    if (!canToggle || status === "processing") {
      return;
    }

    if (checked) {
      await enableNotifications();
    } else {
      await disableNotifications();
    }
  }

  if (showInstallInstructions) {
    const platform = device.isIOS ? "ios" : "android";

    return (
      <div className="flex w-full justify-center px-4 pb-16 pt-10">
        <InstallInstructions
          platform={platform}
          onSkip={() => setShowInstallInstructions(false)}
          skipLabel="Volver a configuración"
        />
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center px-4 pb-16 pt-10">
      <div className="flex w-full max-w-3xl flex-col gap-10">
        <header className="flex w-full items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Volver"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-semibold">Configuración</h1>
          <div className="w-10" />
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Notificaciones</h2>

          <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_10px_30px_rgba(24,94,32,0.06)] sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex flex-1 items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600 shadow-inner">
                <BellIcon className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-base font-semibold">
                  Alertas de nuevos retos
                </p>
                <p className="text-sm text-gray-600">
                  Recibe notificaciones cuando haya un nuevo reto disponible
                </p>
              </div>
            </div>

            <Switch
              checked={status === "subscribed"}
              onCheckedChange={handleToggleChange}
              disabled={!canToggle || status === "processing"}
              className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
            />
          </div>

          {status === "unsupported" && (
            <p className="text-sm text-gray-600">
              Las notificaciones no están disponibles en este navegador.
            </p>
          )}

          {permission === "denied" && status !== "unsupported" && (
            <p className="text-sm text-yellow-700">
              Las notificaciones están bloqueadas. Actívalas en la configuración
              de tu navegador.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
