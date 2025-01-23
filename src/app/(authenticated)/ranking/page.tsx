import { Avatar, Table, Tabs, Text } from "@radix-ui/themes";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { getDailyRanking, getRanking } from "#/app/actions/ranking";

dayjs.extend(duration);

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
                    <Avatar
                      src={position.picture}
                      fallback={position.name[0] ?? ""}
                      size={"2"}
                      radius="full"
                    />
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
                    <Avatar
                      src={position.picture}
                      fallback={position.name[0] ?? ""}
                      size={"2"}
                      radius="full"
                    />
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
