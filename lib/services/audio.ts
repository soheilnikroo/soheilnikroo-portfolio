/**
 * Ambient audio service — HTMLAudio bed + sample cues.
 */
import {
  musicBed,
  playOneShot,
  resetMusicBedIntensity,
  setAudioMasterVolume,
  unlockAudioEngine,
} from "@/lib/audio/html-audio";
import { AUDIO } from "@/lib/audio/paths";
import type { SfxId } from "@/lib/audio/paths";

export type AmbientCue = "hover" | "select" | "reveal" | "transition";

export interface AmbientAudioOptions {
  bedSrc?: string;
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

const CUE_TO_SFX: Record<AmbientCue, SfxId> = {
  hover: "hover",
  select: "select",
  reveal: "reveal",
  transition: "transition",
};

const CUE_VOLUME: Record<AmbientCue, number> = {
  hover: 0.35,
  select: 0.55,
  reveal: 0.6,
  transition: 0.5,
};

class BrowserAmbientAudio implements AmbientAudioController {
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

  async play(): Promise<void> {
    unlockAudioEngine();
    if (!this.bedSrc) return;
    resetMusicBedIntensity();
    const ok = await musicBed.play(this.bedSrc);
    this.active = ok;
  }

  pause(): void {
    musicBed.stop();
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
    setAudioMasterVolume(this.volume);
  }

  cue(cue: AmbientCue): void {
    unlockAudioEngine();
    playOneShot(AUDIO.sfx[CUE_TO_SFX[cue]], CUE_VOLUME[cue]);
  }

  dispose(): void {
    this.pause();
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

export function createAmbientAudio(options?: AmbientAudioOptions): AmbientAudioController {
  if (typeof window === "undefined") return noopController;
  return new BrowserAmbientAudio(options);
}
