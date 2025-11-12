const FALLBACK_APP_URL = "http://localhost:3000";

const vercelUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;

const SERVER_APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? vercelUrl ?? FALLBACK_APP_URL;

export function getServerAppBaseUrl(): string {
  return SERVER_APP_BASE_URL;
}

export function getAppBaseUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return SERVER_APP_BASE_URL;
}
