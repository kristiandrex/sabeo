export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const decoded = window.atob(base64);

  const outputArray = new Uint8Array(decoded.length);

  for (let i = 0; i < decoded.length; i++) {
    outputArray[i] = decoded.charCodeAt(i);
  }

  return outputArray;
}
