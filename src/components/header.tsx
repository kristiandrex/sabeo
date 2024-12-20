"use client";

import { Button } from "@radix-ui/themes";
import { HelpCircleIcon, LogOutIcon, TrophyIcon } from "lucide-react";
import Link from "next/link";

import { createClient } from "#/lib/supabase/client";

export function Header() {
  function signOut() {
    const supabase = createClient();
    supabase.auth.signOut();
  }

  return (
    <header className="flex justify-between items-center gap-16 w-full">
      <div>
        <Link href="/">
          <h1 className="text-4xl font-bold">Sabeo</h1>
        </Link>
      </div>

      <div className="flex gap-4">
        <Button variant="ghost">
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
  );
}
