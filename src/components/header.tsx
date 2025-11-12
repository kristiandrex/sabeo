"use client";

import { useEffect, useState } from "react";
import {
  HelpCircleIcon,
  LogInIcon,
  LogOutIcon,
  SettingsIcon,
  TrophyIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import { Button } from "#/components/ui/button";
import { createClient } from "#/lib/supabase/client";
import { useLocalStorage } from "#/hooks/useLocalStorage";
import { signInWithGoogle } from "#/lib/auth";

import { DialogInstructions } from "./dialog-instructions";

type HeaderProps = {
  initialIsAuthenticated: boolean;
};

export function Header({ initialIsAuthenticated }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [hasSession, setHasSession] = useState(initialIsAuthenticated);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useLocalStorage<boolean>(
    "instructions-v2",
    true,
  );

  useEffect(() => {
    const supabase = createClient();

    const sync = (event: AuthChangeEvent, nextSession: Session | null) => {
      if (event === "INITIAL_SESSION") {
        return;
      }

      setHasSession(Boolean(nextSession));

      fetch("/api/auth/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, session: nextSession }),
      })
        .then(() => router.refresh())
        .catch((error) => {
          console.error("Failed to sync Supabase session", error);
        });
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(sync);

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setHasSession(false);
    router.replace("/");
  }

  async function handleSignIn() {
    try {
      setIsSigningIn(true);
      const returnPath = pathname?.startsWith("/") ? pathname : "/play";
      await signInWithGoogle(returnPath);
    } finally {
      setIsSigningIn(false);
    }
  }

  const AuthIcon = hasSession ? LogOutIcon : LogInIcon;
  const iconColorClass = "text-green-600";
  const iconButtonClass = "text-green-600 hover:bg-green-50 hover:text-green-700";
  const authAriaLabel = hasSession ? "Cerrar sesión" : "Iniciar sesión";
  const authHandler = hasSession ? handleSignOut : handleSignIn;
  const authButtonDisabled = !hasSession && isSigningIn;

  return (
    <>
      <DialogInstructions
        open={instructionsOpen}
        onOpenChange={setInstructionsOpen}
      />

      <header className="flex justify-between items-center gap-4 sm:gap-16 w-full">
        <div className="flex items-center">
          <Link
            href="/play"
            aria-label="Ir al tablero principal"
            className="inline-flex"
          >
            <Image
              src="/icon-512x512.png"
              alt="Sabeo"
              width={64}
              height={64}
              priority
              className="h-16 w-16"
            />
            <span className="sr-only">Sabeo</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {hasSession && (
            <Button
              variant="ghost"
              size="icon"
              className={iconButtonClass}
              asChild
            >
              <Link href="/settings" aria-label="Configuración">
                <SettingsIcon className={iconColorClass} />
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={iconButtonClass}
            onClick={() => setInstructionsOpen(true)}
          >
            <HelpCircleIcon className={iconColorClass} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={iconButtonClass}
            asChild
          >
            <Link href="/ranking" aria-label="Ranking">
              <TrophyIcon className={iconColorClass} />
            </Link>
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <Button
            variant="ghost"
            size="icon"
            onClick={authHandler}
            disabled={authButtonDisabled}
            aria-label={authAriaLabel}
            className={iconButtonClass}
          >
            <AuthIcon className={iconColorClass} />
          </Button>
        </div>
      </header>
    </>
  );
}
