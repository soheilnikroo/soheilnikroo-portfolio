import { ImageResponse } from "next/og";

import { site } from "@/lib/config/site";
import { getProjectBySlug } from "@/lib/data";

export const revalidate = 300;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateAlt({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<string> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug).catch(() => null);
  return project?.title ?? site.name;
}

export default async function ProjectOgImage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug).catch(() => null);
  const title = project?.title ?? site.name;
  const accent = project?.accent ?? "#818cf8";
  const role = project?.role ?? "Project";

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
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, color: accent }}>
        <span style={{ fontSize: 44, fontWeight: 900, color: accent }}>SN</span>
        <span>{role}</span>
      </div>
      <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, maxWidth: 1000 }}>{title}</div>
      <div style={{ fontSize: 30, color: "#a1a1aa" }}>{site.name}</div>
    </div>,
    size,
  );
}
