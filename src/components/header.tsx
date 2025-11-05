"use client";

import { Button } from "@radix-ui/themes";
import {
  HelpCircleIcon,
  LogOutIcon,
  SettingsIcon,
  TrophyIcon,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "#/lib/supabase/client";
import { useLocalStorage } from "#/hooks/useLocalStorage";

import { DialogInstructions } from "./dialog-instructions";

export function Header() {
  const [instructionsOpen, setInstructionsOpen] = useLocalStorage<boolean>(
    "instructions-v2",
    true,
  );

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

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
          <Button variant="ghost" asChild>
            <Link href="/settings" aria-label="Configuración">
              <SettingsIcon />
            </Link>
          </Button>
          <Button variant="ghost" onClick={() => setInstructionsOpen(true)}>
            <HelpCircleIcon />
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/ranking">
              <TrophyIcon />
            </Link>
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <Button variant="ghost" onClick={signOut}>
            <LogOutIcon />
          </Button>
        </div>
      </header>
    </>
  );
}
