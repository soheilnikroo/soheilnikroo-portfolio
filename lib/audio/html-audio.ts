/**
 * Reliable cross-browser audio — single looping bed + one-shot SFX.
 * MP3 preferred (Safari); OGG fallback.
 */

let gestureUnlocked = false;
let muted = false;
let masterVolume = 0.55;

const unlockHandlers = new Set<() => void>();

function mp3(src: string): string {
  return src.endsWith(".ogg") ? `${src.slice(0, -4)}.mp3` : src;
}

function sources(src: string): string[] {
  return src.endsWith(".ogg") ? [mp3(src), src] : [src];
}

export function setAudioMuted(value: boolean): void {
  muted = value;
  if (muted) musicBed.stop();
}

export function setAudioMasterVolume(value: number): void {
  masterVolume = Math.min(1, Math.max(0.15, value));
  musicBed.setMasterVolume(masterVolume);
}

export function isAudioMuted(): boolean {
  return muted;
}

export function unlockAudioEngine(): void {
  gestureUnlocked = true;
  for (const fn of unlockHandlers) fn();
}

export function onAudioUnlock(handler: () => void): () => void {
  unlockHandlers.add(handler);
  if (gestureUnlocked) handler();
  return () => unlockHandlers.delete(handler);
}

export function playOneShot(src: string, volume = 0.6): void {
  if (muted || !gestureUnlocked) return;
  const vol = volume * masterVolume;
  void (async (): Promise<void> => {
    for (const url of sources(src)) {
      const clip = new Audio(url);
      clip.volume = vol;
      try {
        await clip.play();
        return;
      } catch {
        // try next format
      }
    }
  })();
}

/** One looping bed at a time — hard-stops orphans, ignores stale async loads. */
class MusicBed {
  private active: HTMLAudioElement | null = null;
  private activeSrc = "";
  private bedVolume = 0.42;
  private generation = 0;
  private fadeRaf = 0;
  private intensity = 1;

  setMasterVolume(v: number): void {
    this.bedVolume = 0.42 * v;
    this.applyIntensity();
  }

  private applyIntensity(): void {
    if (!this.active) return;
    this.active.volume = this.bedVolume * this.intensity;
  }

  setIntensity(factor: number): void {
    this.intensity = Math.max(0.1, Math.min(1, factor));
    this.applyIntensity();
  }

  resetIntensity(): void {
    this.intensity = 1;
    this.applyIntensity();
  }

  stop(): void {
    this.generation += 1;
    if (this.fadeRaf) cancelAnimationFrame(this.fadeRaf);
    this.fadeRaf = 0;
    if (this.active) {
      this.active.pause();
      this.active.src = "";
    }
    this.active = null;
    this.activeSrc = "";
  }

  private async loadAndPlay(src: string): Promise<HTMLAudioElement | null> {
    for (const url of sources(src)) {
      const bed = new Audio(url);
      bed.loop = true;
      bed.preload = "none";
      try {
        await bed.play();
        return bed;
      } catch {
        // blocked or unsupported format
      }
    }
    return null;
  }

  /** Returns true when the bed is audibly playing. */
  async play(src: string): Promise<boolean> {
    if (muted || !gestureUnlocked) return false;
    if (src === this.activeSrc && this.active && !this.active.paused) {
      this.applyIntensity();
      return true;
    }

    const gen = ++this.generation;
    const next = await this.loadAndPlay(src);
    if (!next || muted || !gestureUnlocked || gen !== this.generation) {
      next?.pause();
      return false;
    }

    if (this.fadeRaf) cancelAnimationFrame(this.fadeRaf);
    this.fadeRaf = 0;

    const outgoing = this.active;
    if (outgoing) {
      outgoing.pause();
      outgoing.src = "";
    }

    this.active = next;
    this.activeSrc = src;
    next.volume = 0;

    const targetVol = this.bedVolume * this.intensity;
    const start = performance.now();
    const fadeMs = 900;

    const tick = (now: number): void => {
      if (gen !== this.generation || this.active !== next) return;
      const t = Math.min(1, (now - start) / fadeMs);
      const ease = t * t * (3 - 2 * t);
      next.volume = targetVol * ease;
      if (t < 1) {
        this.fadeRaf = requestAnimationFrame(tick);
      } else {
        this.fadeRaf = 0;
      }
    };
    this.fadeRaf = requestAnimationFrame(tick);
    return true;
  }
}

export const musicBed = new MusicBed();

export function resetMusicBedIntensity(): void {
  musicBed.resetIntensity();
}

if (typeof window !== "undefined") {
  const prime = (): void => {
    unlockAudioEngine();
    window.removeEventListener("pointerdown", prime);
    window.removeEventListener("keydown", prime);
    window.removeEventListener("wheel", prime);
    window.removeEventListener("touchstart", prime);
  };
  window.addEventListener("pointerdown", prime, { passive: true });
  window.addEventListener("keydown", prime, { passive: true });
  window.addEventListener("wheel", prime, { passive: true });
  window.addEventListener("touchstart", prime, { passive: true });
}
