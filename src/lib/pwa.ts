export const STANDALONE_MEDIA_QUERY = "(display-mode: standalone)";

export type DeviceInfo = {
  isIOS: boolean;
  isAndroid: boolean;
  isStandalone: boolean;
};

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const decoded = window.atob(base64);

  const buffer = new ArrayBuffer(decoded.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < decoded.length; i++) {
    outputArray[i] = decoded.charCodeAt(i);
  }

  return outputArray;
}

export function isStandaloneMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const mediaQuery = window.matchMedia(STANDALONE_MEDIA_QUERY);

  if (mediaQuery.matches) {
    return true;
  }

  const navigatorStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;

  return navigatorStandalone === true;
}

export function detectDevice(): DeviceInfo {
  const initial: DeviceInfo = {
    isIOS: false,
    isAndroid: false,
    isStandalone: false,
  };

  if (typeof window === "undefined") {
    return initial;
  }

  const userAgent = window.navigator.userAgent;

  return {
    isIOS: /iPad|iPhone|iPod/.test(userAgent) && !("MSStream" in window),
    isAndroid: /Android/.test(userAgent),
    isStandalone: isStandaloneMode(),
  };
}

export function isMobileDevice(device: DeviceInfo): boolean {
  return device.isIOS || device.isAndroid;
}

export function watchStandaloneMode(onChange: (isStandalone: boolean) => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia(STANDALONE_MEDIA_QUERY);

  function handleChange(event: MediaQueryListEvent) {
    const nextStandalone = event.matches || isStandaloneMode();
    onChange(nextStandalone);
  }

  mediaQuery.addEventListener("change", handleChange);

  return () => {
    mediaQuery.removeEventListener("change", handleChange);
  };
}

async function ensureServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (typeof window === "undefined") {
    throw new Error("Service workers no disponibles en este entorno");
  }

  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers no soportados en este navegador");
  }

  const existing = await navigator.serviceWorker.getRegistration();

  if (!existing) {
    await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
  }

  return navigator.serviceWorker.ready;
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  const registration = await ensureServiceWorker();
  return registration.pushManager.getSubscription();
}

export async function subscribePlayerToNotifications(playerId: string): Promise<PushSubscription> {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!vapidKey) {
    throw new Error("Missing VAPID public key");
  }

  const registration = await ensureServiceWorker();
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });
  }

  const response = await fetch("/api/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...subscription.toJSON(),
      player: playerId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to persist subscription");
  }

  return subscription;
}

export async function unsubscribeFromNotifications(): Promise<void> {
  const registration = await ensureServiceWorker();
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    return;
  }

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();

  const response = await fetch("/api/unsubscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint }),
  });

  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to remove subscription");
  }
}
