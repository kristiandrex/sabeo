import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Table, Text } from "@radix-ui/themes";

import { createServiceClient } from "#/lib/supabase/server";
import { ChallengeCompleted, RankingPosition } from "#/types";

async function getRanking() {
  try {
    const supabase = await createServiceClient();

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      throw error;
    }

    const challengesCompleted: PostgrestSingleResponse<ChallengeCompleted[]> =
      await supabase.rpc("get_challenges_completed");

    if (challengesCompleted.error) {
      throw challengesCompleted.error;
    }

    const ranking: RankingPosition[] = [];

    for (const challenge of challengesCompleted.data) {
      const player = data.users.find((user) => user.id === challenge.player);

      if (player) {
        ranking.push({
          id: player.id,
          name: player.user_metadata.name,
          picture: player.user_metadata.picture,
          challenges: challenge.total_challenges,
          seconds: challenge.total_seconds,
        });
      }
    }

    return ranking;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RankingPage() {
  const ranking = await getRanking();

  return (
    <main>
      <h2 className="text-2xl font-semibold">Ranking</h2>

      <Table.Root className="mt-2">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Jugador(a)</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Retos</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {ranking.map((position, index) => (
            <Table.Row key={position.id}>
              <Table.RowHeaderCell>{index + 1}</Table.RowHeaderCell>
              <Table.Cell className="flex gap-2 items-center">
                {
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={position.picture}
                    className="h-6 w-6 bg-gray-500 rounded-full"
                  />
                }
                <Text>{position.name}</Text>
              </Table.Cell>
              <Table.Cell>{position.challenges}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </main>
  );
}
