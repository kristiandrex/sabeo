"use client";

import { useEffect, useState } from "react";
import { Button } from "@radix-ui/themes";
import {
  HelpCircleIcon,
  LogInIcon,
  LogOutIcon,
  SettingsIcon,
  TrophyIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import { createClient } from "#/lib/supabase/client";
import { useLocalStorage } from "#/hooks/useLocalStorage";
import { signInWithGoogle } from "#/utils/auth";

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
  const authAriaLabel = hasSession ? "Cerrar sesión" : "Iniciar sesión";
  const authHandler = hasSession ? handleSignOut : handleSignIn;
  const authButtonDisabled = !hasSession && isSigningIn;

  return (
    <>
      <DialogInstructions
        open={instructionsOpen}
        onOpenChange={setInstructionsOpen}
      />

      <header className="flex justify-between items-center gap-16 w-full">
        <div>
          <Link href="/play">
            <h1 className="text-4xl font-bold">Sabeo</h1>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {hasSession && (
            <Button variant="ghost" asChild>
              <Link href="/settings" aria-label="Configuración">
                <SettingsIcon />
              </Link>
            </Button>
          )}
          <Button variant="ghost" onClick={() => setInstructionsOpen(true)}>
            <HelpCircleIcon />
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/ranking">
              <TrophyIcon />
            </Link>
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <Button
            variant="ghost"
            onClick={authHandler}
            disabled={authButtonDisabled}
            aria-label={authAriaLabel}
          >
            <AuthIcon />
          </Button>
        </div>
      </header>
    </>
  );
}
