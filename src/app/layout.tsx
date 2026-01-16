import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Toaster } from "sonner";

import { ThemeProvider } from "#/components/theme-provider";
import { getServerAppBaseUrl } from "#/lib/env";

import "./globals.css";

const appBaseUrl = getServerAppBaseUrl();

export const metadata: Metadata = {
  title: "Sabeo",
  description: "Descubre la palabra del día",
  metadataBase: new URL(appBaseUrl),
  openGraph: {
    title: "Sabeo",
    description: "Descubre la palabra del día",
    url: appBaseUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Sabeo",
    description: "Descubre la palabra del día",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider>
          <div className="h-svh max-w-xl mx-auto p-2 sm:p-4 flex flex-col overflow-hidden gap-8">
            {children}
          </div>
          <Toaster position="top-center" closeButton visibleToasts={1} />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
