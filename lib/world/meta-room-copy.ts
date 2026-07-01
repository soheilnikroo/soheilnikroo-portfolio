import { clamp01 } from "@/lib/engine";
import type { StoryBeat } from "@/lib/schemas/world-narrative";

export interface MetaOverlayBeat {
  readonly at: number;
  readonly kicker?: string;
  readonly title: string;
  readonly body?: string;
}

const ROOM_INTRO: MetaOverlayBeat = {
  at: 0.36,
  kicker: "You made it",
  title: "This is my room.",
  body: "The whole portfolio was running on that center monitor. I'd love to hear from you — scroll down when you're ready.",
};

/** Beats that duplicate the 3D CTA panel — keep those in the bottom panel only. */
function isRedundantContactBeat(text: string): boolean {
  return /email|github|linkedin|instagram|one tap away|résumé|resume pdf/i.test(text);
}

/** Merge the room intro with contact beats that land during the 3D reveal. */
export function buildMetaOverlayBeats(contactBeats: readonly StoryBeat[]): MetaOverlayBeat[] {
  const fromContact = contactBeats
    .filter((beat) => !isRedundantContactBeat(beat.text))
    .map((beat) => ({
      at: clamp01((beat.at - 0.38) / 0.58),
      title: beat.text,
    }))
    .filter((beat) => beat.at >= ROOM_INTRO.at);

  return [ROOM_INTRO, ...fromContact];
}

export function resolveMetaOverlayBeat(
  metaReveal: number,
  beats: readonly MetaOverlayBeat[],
): MetaOverlayBeat | null {
  if (metaReveal < ROOM_INTRO.at) return null;
  let active: MetaOverlayBeat | null = null;
  for (const beat of beats) {
    if (metaReveal >= beat.at) active = beat;
  }
  return active;
}

/** Pop-in strength for the active beat (0 = hidden, 1 = fully visible). */
export function metaBeatPop(metaReveal: number, beat: MetaOverlayBeat | null): number {
  if (!beat) return 0;
  return clamp01((metaReveal - beat.at) / 0.1);
}

/** Bottom CTA panel during the isometric pull-back. */
export function metaCtaPanelOpacity(metaReveal: number): number {
  return clamp01((metaReveal - 0.52) / 0.14);
}
