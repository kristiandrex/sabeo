"use client";

import { usePathname } from "next/navigation";

import { Header } from "./header";

type Props = {
  children: React.ReactNode;
  initialIsAuthenticated: boolean;
};

export function GameLayoutClient({ children, initialIsAuthenticated }: Props) {
  const pathname = usePathname();
  const isSettingsPage = pathname === "/settings";

  return (
    <>
      {!isSettingsPage && <Header initialIsAuthenticated={initialIsAuthenticated} />}
      {children}
    </>
  );
}
