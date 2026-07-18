import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#132d2a",
          color: "#fffdf8",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
        }}
      >
        <div style={{ color: "#dbe89c", fontSize: 30, letterSpacing: 7 }}>TUTOROS 1.0</div>
        <div style={{ fontSize: 64 }}>Every session shapes the next.</div>
      </div>
    ),
    size,
  );
}
