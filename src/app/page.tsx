"use client";

import { useEffect, useState } from "react";
import { Share } from "lucide-react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";

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

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });

    if (registration.active) {
      registration.active.postMessage({ target });
    }

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

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      registerServiceWorker();
    }

    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
    );

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (isIOS && !isStandalone) {
    return (
      <div className="h-screen flex flex-col justify-center items-center gap-2">
        <p>
          Para recibir notificaciones haz click en el botón de compartir{" "}
          <Share className="inline-block" />
        </p>

        <p>
          Luego selecciona &quot;Agregar a la pantalla de inicio&quot; y sigue
          las instrucciones.
        </p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="h-screen grid place-items-center">
        <Button onClick={subscribeToPush}>Activar notificaciones</Button>
      </div>
    );
  }

  return (
    <div className="h-screen grid place-items-center">
      <Button onClick={handleSendNotification}>Enviar notificación</Button>
    </div>
  );
}
