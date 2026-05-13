import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/seo";

export const alt = `${siteConfig.name} · Browser Games`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#1f2022",
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(120,120,255,0.18) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(255,140,180,0.18) 0%, transparent 45%)",
          padding: "80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#f5f5f5",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: "28px",
            color: "#a3a3a3",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              backgroundColor: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "4px",
                backgroundColor: "#1f2022",
              }}
            />
          </div>
          daddel.dev
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: "120px",
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            Browser Games
          </div>
          <div
            style={{
              fontSize: "36px",
              lineHeight: 1.3,
              color: "#bcbcbc",
              maxWidth: "900px",
              letterSpacing: "-0.01em",
            }}
          >
            Reaktion und Wahrnehmung — solo, im Team oder gegen die globale
            Bestenliste.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "32px",
            color: "#f5f5f5",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
          }}
        >
          <span>color</span>
          <span style={{ color: "#5a5a5a" }}>·</span>
          <span>sound</span>
          <span style={{ color: "#5a5a5a" }}>·</span>
          <span>time</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
