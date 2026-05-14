import { ImageResponse } from "next/og";

const size = { width: 180, height: 180 };

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1f2022",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 112,
            height: 112,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
            borderRadius: 28,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              backgroundColor: "#1f2022",
              borderRadius: 12,
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
