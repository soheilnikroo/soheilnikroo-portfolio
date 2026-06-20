import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {};

// Required by @next/mdx with the App Router. Global MDX component overrides
// (custom headings, code blocks, links, etc.) are layered in by the blog system.
export function useMDXComponents(): MDXComponents {
  return components;
}
