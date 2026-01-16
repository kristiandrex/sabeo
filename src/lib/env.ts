const vercelURL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined;

const SERVER_APP_BASE_URL = vercelURL ?? "http://localhost:3000";

export function getServerAppBaseUrl(): string {
  return SERVER_APP_BASE_URL;
}

export function getAppBaseUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return SERVER_APP_BASE_URL;
}
