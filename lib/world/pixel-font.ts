import { Pixelify_Sans } from "next/font/google";

/**
 * Pixel-art UI typeface for the experience and its readable fallback. Exposed as
 * the `--font-pixel` CSS variable; apply `pixelFont.variable` on a wrapper and use
 * `[font-family:var(--font-pixel)]` (or inherit) on the subtree.
 */
export const pixelFont = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pixel",
  display: "swap",
});
