"use client";

import { usePathname } from "next/navigation";

import { Header } from "#/components/header";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSettingsPage = pathname === "/settings";

  return (
    <>
      {!isSettingsPage && <Header />}
      {children}
    </>
  );
}
