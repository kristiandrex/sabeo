// oxlint-disable nextjs/no-img-element

import fs from "node:fs";
import path from "node:path";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { ImageResponse } from "next/og";

import { getChallengeCount, getLatestChallenge } from "#/domain/challenge/queries";

dayjs.extend(utc);
dayjs.extend(timezone);

export const runtime = "nodejs";

const colors = {
  background: "#fafafa",
  foreground: "#232b33",
  muted: "#5b6b7a",
  border: "#d4d9df",
  card: "#ffffff",
  green: "#16a34a",
  yellow: "#ca8a04",
};

function HashIcon({ color }: { color: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

function ClockIcon({ color }: { color: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export async function GET() {
  try {
    const [challenge, challengeCount] = await Promise.all([
      getLatestChallenge(),
      getChallengeCount(),
    ]);

    const iconPath = path.join(process.cwd(), "public", "icon-512x512.png");
    const iconBuffer = fs.readFileSync(iconPath);
    const iconBase64 = `data:image/png;base64,${iconBuffer.toString("base64")}`;

    if (!challenge) {
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
              Descubre la palabra del día
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
              Sin reto disponible
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

    const formattedDate = dayjs(challenge.started_at)
      .tz("America/Bogota")
      .format("DD/MM/YYYY • HH:mm");

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
            Descubre la palabra del día
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
          <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                borderRadius: 16,
                border: `1px solid ${colors.border}`,
                background: colors.card,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                }}
              >
                <HashIcon color={colors.green} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: 28,
                    fontWeight: 600,
                    color: colors.foreground,
                  }}
                >
                  {challengeCount}
                </div>
                <div style={{ display: "flex", fontSize: 15, color: colors.muted }}>
                  Retos publicados
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                borderRadius: 16,
                border: `1px solid ${colors.border}`,
                background: colors.card,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                }}
              >
                <ClockIcon color={colors.yellow} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: 22,
                    fontWeight: 600,
                    color: colors.foreground,
                  }}
                >
                  {formattedDate}
                </div>
                <div style={{ display: "flex", fontSize: 15, color: colors.muted }}>
                  Reto de hoy (COT)
                </div>
              </div>
            </div>
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
    console.error("Error generating OG image:", error);

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
            Descubre la palabra del día
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
