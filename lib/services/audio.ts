/**
 * Ambient audio service (opt-in, accessibility-first).
 *
 * Contract for the cinematic/lofi ambient layer. Audio NEVER autoplays: the UI
 * starts it only after an explicit user gesture, persists the on/off choice, and
 * stays silent when the user prefers reduced motion. The Web Audio implementation
 * is wired in the motion/ambient step; this module defines the stable contract
 * plus an SSR-safe no-op so server and pre-interaction renders are sound-free.
 */

/** Short interaction cues layered over the ambient bed. */
export type AmbientCue = "hover" | "select" | "reveal" | "transition";

export interface AmbientAudioController {
  /** True when the runtime can actually produce sound (browser + Audio API). */
  readonly supported: boolean;
  readonly playing: boolean;
  /** Start the ambient bed. Must be called from a user gesture. */
  play(): Promise<void>;
  /** Pause the ambient bed. */
  pause(): void;
  /** Toggle the ambient bed; resolves to the new playing state. */
  toggle(): Promise<boolean>;
  /** 0..1 master volume for the ambient bed. */
  setVolume(volume: number): void;
  /** Fire a one-shot interaction cue (no-op while muted/unsupported). */
  cue(cue: AmbientCue): void;
  /** Release audio resources. */
  dispose(): void;
}

const noopController: AmbientAudioController = {
  supported: false,
  playing: false,
  play: () => Promise.resolve(),
  pause: () => {},
  toggle: () => Promise.resolve(false),
  setVolume: () => {},
  cue: () => {},
  dispose: () => {},
};

/**
 * Returns the SSR-safe no-op controller. The browser implementation is provided
 * by the ambient feature module once asset wiring lands.
 */
export function createAmbientAudio(): AmbientAudioController {
  if (typeof window === "undefined") return noopController;
  return noopController;
}
