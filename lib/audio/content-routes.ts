import { AUDIO } from "@/lib/audio/paths";

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
