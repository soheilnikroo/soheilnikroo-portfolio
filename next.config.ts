import path from "node:path";
import { fileURLToPath } from "node:url";

import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const threePatched = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "lib/world/three-patched.ts",
);
const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      { pathname: "/world/**" },
      { pathname: "/world/scenes/intro-hero-dawn.png" },
      { pathname: "/work/**" },
    ],
    remotePatterns: [{ hostname: "cdn.simpleicons.org", pathname: "/**" }],
  },
  experimental: {
    viewTransition: true,
  },
  turbopack: {
    resolveAlias: {
      three: "./lib/world/three-patched.ts",
    },
  },
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      three: threePatched,
    };
    return config;
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cache-Control", value: "no-store, private" },
        ],
      },
      {
        source: "/api/admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, private" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/world/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/audio/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: [
      "rehype-slug",
      ["rehype-autolink-headings", { behavior: "wrap" }],
      ["rehype-pretty-code", { theme: "github-dark" }],
    ],
  },
});
export default withMDX(nextConfig);
