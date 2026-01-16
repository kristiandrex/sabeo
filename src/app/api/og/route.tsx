import { ImageResponse } from "next/og";
import { getChallengeCount, getLatestChallenge } from "#/domain/challenge/queries";
import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export const runtime = "nodejs";

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
        (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              background: "linear-gradient(to bottom, rgb(22, 163, 74), rgb(21, 128, 61))",
              color: "white",
              fontFamily: "system-ui, -apple-system, sans-serif",
              textAlign: "center",
              padding: "80px",
            }}
          >
            <img src={iconBase64} width={180} height={180} alt="Sabeo" />
            <div style={{ fontSize: 72, fontWeight: "bold", marginTop: 40 }}>
              Sabeo
            </div>
            <div style={{ fontSize: 42, marginTop: 60 }}>
              Sin reto disponible
            </div>
            <div style={{ fontSize: 28, marginTop: 40, opacity: 0.8 }}>
              Descubre la palabra del día
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    const formattedDate = dayjs(challenge.started_at)
      .tz("America/Bogota")
      .format("DD/MM/YYYY • HH:mm");

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "linear-gradient(to bottom, rgb(22, 163, 74), rgb(21, 128, 61))",
            color: "white",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textAlign: "center",
            padding: "80px",
          }}
        >
          <img src={iconBase64} width={180} height={180} alt="Sabeo" />
          <div style={{ fontSize: 72, fontWeight: "bold", marginTop: 40 }}>
            Sabeo
          </div>
          <div style={{ fontSize: 42, marginTop: 40 }}>
            Reto #{challengeCount} publicado
          </div>
          <div style={{ fontSize: 36, marginTop: 40 }}>
            🕐 Reto de hoy
          </div>
          <div style={{ fontSize: 32, marginTop: 10 }}>
            {formattedDate} (COT)
          </div>
          <div style={{ fontSize: 28, marginTop: 40, opacity: 0.8 }}>
            Descubre la palabra del día
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "linear-gradient(to bottom, rgb(22, 163, 74), rgb(21, 128, 61))",
            color: "white",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 48,
          }}
        >
          Sabeo
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
