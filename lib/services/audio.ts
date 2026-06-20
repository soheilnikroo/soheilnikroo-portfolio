/**
 * Ambient audio service (opt-in, accessibility-first).
 *
 * Audio NEVER autoplays: the UI starts it only after an explicit user gesture,
 * persists the on/off choice, and stays silent under reduced motion. Interaction
 * cues are synthesized with the Web Audio API (no assets, no licensing). The
 * optional lofi "bed" is an HTMLAudioElement pointing at a user-supplied file.
 */

export type AmbientCue = "hover" | "select" | "reveal" | "transition";

export interface AmbientAudioOptions {
  /** Optional looping background track (e.g. "/audio/ambient.mp3"). */
  bedSrc?: string;
  /** Master volume 0..1. */
  volume?: number;
}

export interface AmbientAudioController {
  readonly supported: boolean;
  readonly playing: boolean;
  play(): Promise<void>;
  pause(): void;
  toggle(): Promise<boolean>;
  setVolume(volume: number): void;
  cue(cue: AmbientCue): void;
  dispose(): void;
}

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

const CUE_FREQUENCY: Record<AmbientCue, number> = {
  hover: 880,
  select: 660,
  reveal: 520,
  transition: 392,
};

class BrowserAmbientAudio implements AmbientAudioController {
  private context: AudioContext | null = null;
  private bed: HTMLAudioElement | null = null;
  private readonly bedSrc?: string;
  private volume: number;
  private active = false;

  constructor(options?: AmbientAudioOptions) {
    this.bedSrc = options?.bedSrc;
    this.volume = clamp01(options?.volume ?? 0.5);
  }

  get supported(): boolean {
    return true;
  }

  get playing(): boolean {
    return this.active;
  }

  private ensureContext(): AudioContext | null {
    if (this.context) return this.context;
    const Ctor = window.AudioContext;
    if (typeof Ctor !== "function") return null;
    this.context = new Ctor();
    return this.context;
  }

  async play(): Promise<void> {
    const ctx = this.ensureContext();
    if (ctx && ctx.state === "suspended") {
      await ctx.resume();
    }
    if (this.bedSrc) {
      if (!this.bed) {
        this.bed = new Audio(this.bedSrc);
        this.bed.loop = true;
      }
      this.bed.volume = this.volume;
      try {
        await this.bed.play();
      } catch {
        // Missing asset or blocked gesture — cues still work; fail silently.
      }
    }
    this.active = true;
  }

  pause(): void {
    this.bed?.pause();
    this.active = false;
  }

  async toggle(): Promise<boolean> {
    if (this.active) {
      this.pause();
      return false;
    }
    await this.play();
    return true;
  }

  setVolume(volume: number): void {
    this.volume = clamp01(volume);
    if (this.bed) this.bed.volume = this.volume;
  }

  cue(cue: AmbientCue): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = CUE_FREQUENCY[cue];
    const peak = 0.04 * this.volume;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  dispose(): void {
    this.bed?.pause();
    this.bed = null;
    void this.context?.close();
    this.context = null;
    this.active = false;
  }
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

/** Create an ambient audio controller; returns an SSR-safe no-op on the server. */
export function createAmbientAudio(options?: AmbientAudioOptions): AmbientAudioController {
  if (typeof window === "undefined" || typeof window.AudioContext !== "function") {
    return noopController;
  }
  return new BrowserAmbientAudio(options);
}
