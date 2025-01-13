import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Theme } from "@radix-ui/themes";

import "@radix-ui/themes/styles.css";
import "./globals.css";

import { OnboardingSteps } from "#/components/onboarding-steps";

export const metadata: Metadata = {
  title: "Sabeo",
  description: "Descubre la palabra en el menor tiempo posible",
  openGraph: {
    title: "Sabeo",
    description: "Descubre la palabra en el menor tiempo posible",
    url: "https://sabeo.vercel.app/",
    images: [
      {
        url: "https://sabeo.vercel.app/icon-512x512.png",
        width: 512,
        height: 512,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <Theme
          accentColor="green"
          className="h-svh p-2 sm:p-4 flex flex-col overflow-hidden gap-8 max-w-xl mx-auto"
        >
          <OnboardingSteps>{children}</OnboardingSteps>
        </Theme>
        <Toaster position="top-center" closeButton />
      </body>
    </html>
  );
}
