import { ImageResponse } from "next/og";

import { site } from "@/lib/config/site";
import { getPostMetaBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function PostOgImage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;
  const meta = await getPostMetaBySlug(slug).catch(() => null);
  const title = meta?.title ?? site.name;
  const category = meta?.category ?? "Writing";
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "radial-gradient(70% 70% at 20% 10%, #131326 0%, #060606 70%)",
        color: "#ffffff",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, color: "#a5b4fc" }}
      >
        <span style={{ fontSize: 44, fontWeight: 900, color: "#818cf8" }}>SN</span>
        <span>{category}</span>
      </div>
      <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, maxWidth: 1000 }}>{title}</div>
      <div style={{ fontSize: 30, color: "#a1a1aa" }}>{site.name}</div>
    </div>,
    size,
  );
}
