import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Table, Tabs, Text } from "@radix-ui/themes";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { createServiceClient } from "#/lib/supabase/server";
import {
  ChallengeCompleted,
  DailyChallengeCompleted,
  RankingPosition,
} from "#/types";

dayjs.extend(duration);

async function getDailyRanking() {
  try {
    const supabase = await createServiceClient();

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      throw error;
    }

    const dailyChallenges: PostgrestSingleResponse<DailyChallengeCompleted[]> =
      await supabase.rpc("get_daily_ranking");

    if (dailyChallenges.error) {
      throw dailyChallenges.error;
    }

    const ranking: RankingPosition[] = [];

    for (const challenge of dailyChallenges.data) {
      const player = data.users.find((user) => user.id === challenge.player);

      if (player) {
        ranking.push({
          id: player.id,
          name: player.user_metadata.name,
          picture: player.user_metadata.picture,
          challenges: 1,
          seconds: challenge.seconds,
        });
      }
    }

    return ranking;
  } catch (error) {
    console.error(error);
    return [];
  }
}

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

function formatSeconds(seconds: number) {
  return dayjs.duration(seconds, "seconds").format("HH:mm:ss");
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RankingPage() {
  const ranking = await getRanking();
  const dailyRanking = await getDailyRanking();

  return (
    <main>
      <h2 className="text-2xl font-semibold">Ranking</h2>

      <Tabs.Root defaultValue="general">
        <Tabs.List justify={"center"}>
          <Tabs.Trigger value="general">General</Tabs.Trigger>
          <Tabs.Trigger value="daily">Diario</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="general">
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
        </Tabs.Content>

        <Tabs.Content value="daily">
          <Table.Root className="mt-2">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Jugador(a)</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Tiempo</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {dailyRanking.map((position, index) => (
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
                  <Table.Cell>{formatSeconds(position.seconds)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Tabs.Content>
      </Tabs.Root>
    </main>
  );
}
