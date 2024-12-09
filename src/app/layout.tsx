import type { Metadata } from "next";
import { Toaster } from "sonner";

import "@radix-ui/themes/styles.css";
import "./globals.css";
import { Theme } from "@radix-ui/themes";

export const metadata: Metadata = {
  title: "Palabra del día",
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
        <Toaster />
      </body>
    </html>
  );
}
