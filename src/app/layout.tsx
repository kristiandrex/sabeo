import type { Metadata } from "next";

import { Toaster } from "#/components/ui/sonner";

import "./globals.css";

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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
