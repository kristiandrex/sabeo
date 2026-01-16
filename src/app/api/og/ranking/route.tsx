import fs from "node:fs";
import path from "node:path";

import { ImageResponse } from "next/og";

import { getRanking } from "#/domain/ranking/queries";
import type { SeasonRankingPosition } from "#/domain/ranking/types";

export const runtime = "nodejs";

const colors = {
  background: "#fafafa",
  foreground: "#232b33",
  muted: "#5b6b7a",
  border: "#d4d9df",
  card: "#ffffff",
  rankBg: "#f4f4f5",
  rankText: "#52525b",
};

function truncateName(name: string, maxLength: number = 18): string {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 3) + "...";
}

function RankingRow({
  position,
  player,
}: {
  position: number;
  player: SeasonRankingPosition;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: 20,
        border: `1px solid ${colors.border}`,
        background: colors.card,
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 999,
            background: colors.rankBg,
            color: colors.rankText,
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {position}
        </div>
        <img
          src={
            player.picture ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=f1f5f9&color=1f2937&size=48`
          }
          width={40}
          height={40}
          alt={player.name}
          style={{ borderRadius: "50%" }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 600,
              color: colors.foreground,
            }}
          >
            {truncateName(player.name)}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <div
          style={{
            display: "flex",
            fontSize: 20,
            fontWeight: 600,
            color: colors.foreground,
          }}
        >
          {player.seasonPoints}
        </div>
        <div style={{ display: "flex", fontSize: 18, color: colors.muted }}>
          pts
        </div>
      </div>
    </div>
  );
}

export async function GET() {
  try {
    const ranking = await getRanking();
    const topPlayers = ranking.slice(0, 3);
    const [firstPlayer, secondPlayer, thirdPlayer] = topPlayers;

    const iconPath = path.join(process.cwd(), "public", "icon-512x512.png");
    const iconBuffer = fs.readFileSync(iconPath);
    const iconBase64 = `data:image/png;base64,${iconBuffer.toString("base64")}`;

    if (topPlayers.length === 0) {
      return new ImageResponse(
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            background: colors.background,
            color: colors.foreground,
            fontFamily: "system-ui, -apple-system, sans-serif",
            padding: "64px 80px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div
              style={{
                display: "flex",
                fontSize: 64,
                fontWeight: 700,
                color: colors.foreground,
              }}
            >
              Sabeo
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 30,
                color: colors.muted,
                marginTop: 12,
              }}
            >
              Top de jugadores
            </div>
            <div
              style={{
                display: "flex",
                width: "100%",
                height: 1,
                background: colors.border,
                marginTop: 32,
                marginBottom: 32,
              }}
            />
            <div style={{ display: "flex", fontSize: 24, color: colors.muted }}>
              Sin jugadores todavía
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 18,
                color: colors.muted,
                marginTop: 12,
              }}
            >
              Compite en el ranking
            </div>
          </div>
          <img
            src={iconBase64}
            width={200}
            height={200}
            alt="Sabeo"
            style={{ marginLeft: 60, borderRadius: 24 }}
          />
        </div>,
        { width: 1200, height: 630 },
      );
    }

    return new ImageResponse(
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: colors.background,
          color: colors.foreground,
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "64px 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              color: colors.foreground,
            }}
          >
            Sabeo
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: colors.muted,
              marginTop: 12,
            }}
          >
            Top de jugadores
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              height: 1,
              background: colors.border,
              marginTop: 32,
              marginBottom: 24,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {firstPlayer && <RankingRow position={1} player={firstPlayer} />}
            {secondPlayer && <RankingRow position={2} player={secondPlayer} />}
            {thirdPlayer && <RankingRow position={3} player={thirdPlayer} />}
          </div>
        </div>
        <img
          src={iconBase64}
          width={200}
          height={200}
          alt="Sabeo"
          style={{ marginLeft: 60, borderRadius: 24 }}
        />
      </div>,
      { width: 1200, height: 630 },
    );
  } catch (error) {
    console.error("Error generating ranking OG image:", error);

    const iconPath = path.join(process.cwd(), "public", "icon-512x512.png");
    const iconBuffer = fs.readFileSync(iconPath);
    const iconBase64 = `data:image/png;base64,${iconBuffer.toString("base64")}`;

    return new ImageResponse(
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: colors.background,
          color: colors.foreground,
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "64px 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              color: colors.foreground,
            }}
          >
            Sabeo
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: colors.muted,
              marginTop: 12,
            }}
          >
            Top de jugadores
          </div>
        </div>
        <img
          src={iconBase64}
          width={200}
          height={200}
          alt="Sabeo"
          style={{ marginLeft: 60, borderRadius: 24 }}
        />
      </div>,
      { width: 1200, height: 630 },
    );
  }
}
