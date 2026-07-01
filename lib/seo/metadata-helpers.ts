import type { Metadata } from "next";

export function absoluteUrl(baseUrl: string, path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, baseUrl).toString();
}

export function pageTwitter(
  title: string,
  description: string,
  handle: string,
): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    title,
    description,
    creator: handle,
  };
}

export function ogImageEntries(siteUrl: string, ...paths: string[]) {
  return paths.map((path) => ({ url: absoluteUrl(siteUrl, path) }));
}

export function resolveOgImage(
  siteUrl: string,
  assetPath: string | undefined,
  generatedPath: string,
): string {
  return assetPath ? absoluteUrl(siteUrl, assetPath) : absoluteUrl(siteUrl, generatedPath);
}
