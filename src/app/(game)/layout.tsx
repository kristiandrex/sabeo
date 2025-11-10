import { createClient } from "#/lib/supabase/server";
import { GameLayoutClient } from "#/components/game-layout-client";

type Props = {
  children: React.ReactNode;
};

export const dynamic = "force-dynamic";

export default async function GameLayout({ children }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <GameLayoutClient initialIsAuthenticated={Boolean(user)}>
      {children}
    </GameLayoutClient>
  );
}
