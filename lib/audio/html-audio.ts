let gestureUnlocked = false;
let muted = false;
let masterVolume = 0.75;
const BED_GAIN = 0.68;
const unlockHandlers = new Set<() => void>();
const SILENT_AUDIO =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
let silentPrime: HTMLAudioElement | null = null;

function mp3(src: string): string {
  return src.endsWith(".ogg") ? `${src.slice(0, -4)}.mp3` : src;
}
function sources(src: string): string[] {
  return src.endsWith(".ogg") ? [mp3(src), src] : [src];
}
function configureAudioElement(el: HTMLAudioElement, loop = false): void {
  el.loop = loop;
  el.preload = "auto";
  el.setAttribute("playsinline", "");
}
function primeGestureUnlock(): boolean {
  if (gestureUnlocked) return true;
  try {
    silentPrime ??= new Audio(SILENT_AUDIO);
    silentPrime.volume = 0.001;
    configureAudioElement(silentPrime);
    const playPromise = silentPrime.play();
    gestureUnlocked = true;
    void playPromise?.catch(() => {
      gestureUnlocked = false;
    });
    return gestureUnlocked;
  } catch {
    return false;
  }
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
  primeGestureUnlock();
  if (!gestureUnlocked) return;
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
  for (const url of sources(src)) {
    const clip = new Audio(url);
    configureAudioElement(clip);
    clip.volume = vol;
    try {
      void clip.play();
      return;
    } catch {}
  }
}
class MusicBed {
  private active: HTMLAudioElement | null = null;
  private activeSrc = "";
  private bedVolume = BED_GAIN * masterVolume;
  private generation = 0;
  private fadeRaf = 0;
  private intensity = 1;
  setMasterVolume(v: number): void {
    this.bedVolume = BED_GAIN * v;
    this.applyIntensity();
  }
  private applyIntensity(): void {
    if (!this.active) return;
    this.active.volume = this.bedVolume * this.intensity;
  }
  private fadeIn(gen: number, bed: HTMLAudioElement): void {
    if (this.fadeRaf) cancelAnimationFrame(this.fadeRaf);
    bed.volume = 0;
    const targetVol = this.bedVolume * this.intensity;
    const start = performance.now();
    const fadeMs = 900;
    const tick = (now: number): void => {
      if (gen !== this.generation || this.active !== bed) return;
      const t = Math.min(1, (now - start) / fadeMs);
      const ease = t * t * (3 - 2 * t);
      bed.volume = targetVol * ease;
      if (t < 1) {
        this.fadeRaf = requestAnimationFrame(tick);
      } else {
        this.fadeRaf = 0;
      }
    };
    this.fadeRaf = requestAnimationFrame(tick);
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
  playFromGesture(src: string): boolean {
    if (muted || !gestureUnlocked) return false;
    if (src === this.activeSrc && this.active && !this.active.paused) {
      this.applyIntensity();
      return true;
    }
    const gen = ++this.generation;
    if (this.fadeRaf) cancelAnimationFrame(this.fadeRaf);
    this.fadeRaf = 0;
    for (const url of sources(src)) {
      const bed = new Audio(url);
      configureAudioElement(bed, true);
      try {
        const promise = bed.play();
        if (gen !== this.generation) {
          bed.pause();
          return false;
        }
        const outgoing = this.active;
        if (outgoing) {
          outgoing.pause();
          outgoing.src = "";
        }
        this.active = bed;
        this.activeSrc = src;
        void promise?.catch(() => {
          if (this.active === bed) this.stop();
        });
        this.fadeIn(gen, bed);
        return true;
      } catch {}
    }
    return false;
  }
  private async loadAndPlay(src: string): Promise<HTMLAudioElement | null> {
    for (const url of sources(src)) {
      const bed = new Audio(url);
      configureAudioElement(bed, true);
      try {
        await bed.play();
        return bed;
      } catch {}
    }
    return null;
  }
  async play(src: string): Promise<boolean> {
    if (muted || !gestureUnlocked) return false;
    if (this.playFromGesture(src)) return true;
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
    this.fadeIn(gen, next);
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
