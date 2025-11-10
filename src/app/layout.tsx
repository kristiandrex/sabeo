import type { Metadata } from "next";
import { Toaster } from "sonner";

import { ThemeProvider } from "#/components/theme-provider";

import "./globals.css";

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
    <html lang="es" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider>
          <div className="h-svh max-w-xl mx-auto p-2 sm:p-4 flex flex-col overflow-hidden gap-8">
            {children}
          </div>
          <Toaster position="top-center" closeButton visibleToasts={1} />
        </ThemeProvider>
      </body>
    </html>
  );
}
