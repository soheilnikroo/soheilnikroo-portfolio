import type * as React from "react";

/**
 * Original pixel avatar (no third-party IP), drawn as crisp-edged SVG rects.
 * Two poses: idle (standing) and fall (arms up, legs spread). Placeholder art —
 * swap the grids/palette to refine.
 */
const PALETTE: Record<string, string> = {
  H: "#2a2730", // hair
  F: "#f1c9a5", // face / skin
  E: "#15151a", // eyes
  C: "#22d3ee", // scarf (accent)
  B: "#6366f1", // shirt
  A: "#e8b890", // arms
  P: "#27272a", // pants
  S: "#111114", // shoes
};

const IDLE = [
  "...HHHHHH...",
  "..HHHHHHHH..",
  "..HFFFFFFH..",
  "..FFEFFEFF..",
  "..FFFFFFFF..",
  "..CCCCCCCC..",
  ".BBBBBBBBBB.",
  ".BBBBBBBBBB.",
  ".ABBBBBBBBA.",
  ".ABBBBBBBBA.",
  "..BBBBBBBB..",
  "..PPPPPPPP..",
  "..PPP..PPP..",
  "..PPP..PPP..",
  "..SSS..SSS..",
];

const FALL = [
  "...HHHHHH...",
  "..HHHHHHHH..",
  "..HFFFFFFH..",
  "..FFEFFEFF..",
  "..FFFFFFFF..",
  "..CCCCCCCC..",
  "A.BBBBBBBB.A",
  "A.BBBBBBBB.A",
  "..BBBBBBBB..",
  "..BBBBBBBB..",
  "..PPPPPPPP..",
  ".PPP....PPP.",
  ".PPP....PPP.",
  ".SSS....SSS.",
  "............",
];

function spriteRects(grid: string[]) {
  const rects: React.ReactElement[] = [];
  grid.forEach((row, y) => {
    row.split("").forEach((ch, x) => {
      const fill = PALETTE[ch];
      if (fill) {
        rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />);
      }
    });
  });
  return rects;
}

export function PixelCharacter({
  pose = "idle",
  className,
}: {
  pose?: "idle" | "fall";
  className?: string;
}) {
  const grid = pose === "fall" ? FALL : IDLE;
  return (
    <svg
      viewBox="0 0 12 15"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {spriteRects(grid)}
    </svg>
  );
}
