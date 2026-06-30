import { ImageResponse } from "next/og";

import { site } from "@/lib/config/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = site.title;

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(60% 60% at 50% 35%, #15110a 0%, #060606 70%)",
        color: "#ffffff",
      }}
    >
      <div style={{ fontSize: 300, fontWeight: 900, color: "#818cf8", lineHeight: 1 }}>SN</div>
      <div style={{ marginTop: 24, fontSize: 52, fontWeight: 700 }}>{site.name}</div>
      <div style={{ marginTop: 12, fontSize: 28, color: "#a5b4fc" }}>Software Engineer</div>
    </div>,
    size,
  );
}
