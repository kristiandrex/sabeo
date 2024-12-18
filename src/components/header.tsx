import { createClient } from "#/lib/supabase/client";
import { Button, Heading } from "@radix-ui/themes";
import { LogOutIcon, TrophyIcon } from "lucide-react";

export function Header() {
  function signOut() {
    const supabase = createClient();
    supabase.auth.signOut();
  }

  return (
    <header className="flex items-center gap-16">
      <Button variant="ghost">
        <TrophyIcon />
      </Button>
      <Heading className="text-4xl">Sabeo</Heading>
      <Button variant="ghost" onClick={signOut}>
        <LogOutIcon />
      </Button>
    </header>
  );
}
