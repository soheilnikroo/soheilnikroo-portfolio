import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow MDX/Markdown files to be treated as pages and routes.
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  experimental: {
    // Enable React's <ViewTransition> integration for route navigations.
    viewTransition: true,
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
