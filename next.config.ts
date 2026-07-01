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
    localPatterns: [{ pathname: "/world/**" }],
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
        source: "/world/:path*",
        headers: [
          {
            key: "Cache-Control",
            // Revalidate after deploys — filenames are stable but content changes.
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

// Turbopack requires remark/rehype plugins to be referenced by string name
// (serializable config) because JS functions cannot be passed to the Rust core.
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
