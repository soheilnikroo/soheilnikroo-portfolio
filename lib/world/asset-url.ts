export function worldAssetUrl(path: string): string {
  const version = process.env.NEXT_PUBLIC_ASSET_VERSION?.trim();
  if (!version) return path;
  const joiner = path.includes("?") ? "&" : "?";
  return `${path}${joiner}v=${encodeURIComponent(version)}`;
}
