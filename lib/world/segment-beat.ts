export interface SegmentBeat {
  readonly idx: number;
  readonly opacity: number;
  readonly scale: number;
  readonly y: number;
}
export function segmentBeat(
  local: number,
  count: number,
  zoneStart: number,
  zoneEnd: number,
  opts?: {
    readonly fadeIn?: number;
    readonly fadeOut?: number;
  },
): SegmentBeat | null {
  if (count <= 0) return null;
  if (local < zoneStart || local >= zoneEnd) return null;
  const fadeIn = opts?.fadeIn ?? 0.08;
  const fadeOut = opts?.fadeOut ?? 0.92;
  const t = (local - zoneStart) / (zoneEnd - zoneStart);
  const slot = t * count;
  const idx = Math.min(count - 1, Math.floor(slot));
  const seg = slot - idx;
  const holdEnd = 1 - fadeOut;
  const opacity = seg < fadeIn ? seg / fadeIn : seg > fadeOut ? (1 - seg) / holdEnd : 1;
  const o = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity;
  return {
    idx,
    opacity: o,
    scale: 0.92 + o * 0.08,
    y: (1 - o) * 18,
  };
}

/** Story captions get wider scroll zones so fast scroll does not skip readable beats. */
export function resolveStoryBeatIndex(
  local: number,
  beats: readonly { readonly at: number }[],
): number {
  if (beats.length === 0) return -1;
  for (let i = 0; i < beats.length; i += 1) {
    const cur = beats[i]?.at ?? 0;
    const prev = beats[i - 1]?.at;
    const next = beats[i + 1]?.at;
    const start = i === 0 ? 0 : (prev! + cur) / 2;
    const end = next !== undefined ? (cur + next) / 2 : 1;
    if (local >= start && local < end) return i;
  }
  return beats.length - 1;
}
