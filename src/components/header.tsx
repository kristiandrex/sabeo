"use client";

import { Button } from "@radix-ui/themes";
import { LogOutIcon, TrophyIcon } from "lucide-react";
import Link from "next/link";

import { createClient } from "#/lib/supabase/client";

export function Header() {
  function signOut() {
    const supabase = createClient();
    supabase.auth.signOut();
  }

  return (
    <header className="flex justify-center items-center gap-16 w-full">
      <Button variant="ghost" asChild>
        <Link href="/ranking">
          <TrophyIcon />
        </Link>
      </Button>
      <Link href="/">
        <h1 className="text-4xl font-bold">Sabeo</h1>
      </Link>
      <Button variant="ghost" onClick={signOut}>
        <LogOutIcon />
      </Button>
    </header>
  );
}
