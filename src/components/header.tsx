"use client";

import { Button } from "@radix-ui/themes";
import { HelpCircleIcon, LogOutIcon, TrophyIcon } from "lucide-react";
import Link from "next/link";

import { createClient } from "#/lib/supabase/client";
import { useLocalStorage } from "#/hooks/useLocalStorage";

import { DialogInstructions } from "./dialog-instructions";

export function Header() {
  const [instructionsOpen, setInstructionsOpen] = useLocalStorage<boolean>(
    "instructions",
    true
  );

  function signOut() {
    const supabase = createClient();
    supabase.auth.signOut();
  }

  return (
    <>
      <DialogInstructions
        open={instructionsOpen}
        onOpenChange={setInstructionsOpen}
      />

      <header className="flex justify-between items-center gap-16 w-full">
        <div>
          <Link href="/">
            <h1 className="text-4xl font-bold">Sabeo</h1>
          </Link>
        </div>

        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => setInstructionsOpen(true)}>
            <HelpCircleIcon />
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/ranking">
              <TrophyIcon />
            </Link>
          </Button>
          <Button variant="ghost" onClick={signOut}>
            <LogOutIcon />
          </Button>
        </div>
      </header>
    </>
  );
}
