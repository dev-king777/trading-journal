import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          color: "white",
          background: "radial-gradient(circle at 20% 20%, rgba(0,217,255,.35), transparent 30%), #0a0a0f"
        }}
      >
        <div style={{ color: "#00d9ff", fontSize: 28, letterSpacing: 6 }}>EDGEJOURNAL</div>
        <div style={{ marginTop: 24, fontSize: 82, fontWeight: 700, lineHeight: 1 }}>Turn every trade into evidence.</div>
      </div>
    ),
    size
  );
}
