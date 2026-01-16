import { ImageResponse } from "next/og";
import { getRanking } from "#/domain/ranking/queries";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

function truncateName(name: string, maxLength: number = 20): string {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 3) + "...";
}

export async function GET() {
  try {
    const ranking = await getRanking();
    const topPlayers = ranking.slice(0, 3);

    const iconPath = path.join(process.cwd(), "public", "icon-512x512.png");
    const iconBuffer = fs.readFileSync(iconPath);
    const iconBase64 = `data:image/png;base64,${iconBuffer.toString("base64")}`;

    const medals = ["🥇", "🥈", "🥉"];

    if (topPlayers.length === 0) {
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
            <div style={{ fontSize: 64, fontWeight: "bold", marginTop: 40, display: "flex", alignItems: "center" }}>
              🏆 Mejores Jugadores
            </div>
            <div style={{ fontSize: 42, marginTop: 60 }}>
              Sin jugadores todavía
            </div>
            <div style={{ fontSize: 28, marginTop: 40, opacity: 0.8 }}>
              Compite en el ranking
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            background: "linear-gradient(to bottom, rgb(22, 163, 74), rgb(21, 128, 61))",
            color: "white",
            fontFamily: "system-ui, -apple-system, sans-serif",
            padding: "60px 80px",
          }}
        >
          <img src={iconBase64} width={100} height={100} alt="Sabeo" />
          <div style={{ fontSize: 64, fontWeight: "bold", marginTop: 40 }}>
            🏆 Mejores Jugadores
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 30, marginTop: 50 }}>
            {topPlayers.map((player, index) => (
              <div key={player.id} style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 36 }}>
                <span style={{ fontSize: 48 }}>{medals[index]}</span>
                <img 
                  src={player.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=10b981&color=fff&size=60`}
                  width={60} 
                  height={60} 
                  alt={player.name}
                  style={{ borderRadius: "50%" }}
                />
                <span style={{ flex: 1 }}>{truncateName(player.name)}</span>
                <span style={{ fontWeight: "bold" }}>• {player.seasonPoints} pts</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 28, marginTop: "auto", opacity: 0.8 }}>
            Compite en el ranking
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (error) {
    console.error("Error generating ranking OG image:", error);
    
    const iconPath = path.join(process.cwd(), "public", "icon-512x512.png");
    const iconBuffer = fs.readFileSync(iconPath);
    const iconBase64 = `data:image/png;base64,${iconBuffer.toString("base64")}`;
    
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
          }}
        >
          <img src={iconBase64} width={120} height={120} alt="Sabeo" />
          <div style={{ fontSize: 48, fontWeight: "bold", marginTop: 40 }}>
            Sabeo Ranking
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
