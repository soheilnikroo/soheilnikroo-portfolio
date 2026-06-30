import { AUDIO } from "@/lib/audio/paths";

/** Readable + listing pages share one looping intro bed — no scroll chapter swaps. */
export function isContentMusicRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/read" ||
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === "/work" ||
    pathname.startsWith("/work/")
  );
}

export const CONTENT_MUSIC_BED = AUDIO.music.intro;
