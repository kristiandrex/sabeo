import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Theme } from "@radix-ui/themes";

import "@radix-ui/themes/styles.css";
import "./globals.css";

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
        <Theme>{children}</Theme>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
