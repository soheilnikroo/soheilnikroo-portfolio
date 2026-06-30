import type { MetadataRoute } from "next";

import { getSiteSettings } from "@/lib/data/site-settings";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSiteSettings();
  return {
    name: settings.name,
    short_name: "SN",
    description: settings.description,
    start_url: "/",
    display: "standalone",
    background_color: "#060606",
    theme_color: "#818cf8",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
