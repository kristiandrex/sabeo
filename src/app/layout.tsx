import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Theme } from "@radix-ui/themes";

import "@radix-ui/themes/styles.css";
import "./globals.css";

import { OnboardingSteps } from "#/components/onboarding-steps";

export const metadata: Metadata = {
  title: "Sabeo",
  description: "Descubre la palabra en el menor tiempo posible",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <Theme accentColor="green">
          <OnboardingSteps>{children}</OnboardingSteps>
        </Theme>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
