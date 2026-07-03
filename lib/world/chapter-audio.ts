import {
  musicBed,
  onAudioUnlock,
  setAudioMasterVolume,
  setAudioMuted,
  unlockAudioEngine,
} from "@/lib/audio/html-audio";
import { AUDIO } from "@/lib/audio/paths";

const CHAPTER_IDS = ["intro", "work", "skills", "writing", "contact"] as const;
export interface ChapterAudioPreset {
  readonly id: string;
  readonly bedSrc: string;
}
export const CHAPTER_AUDIO: readonly ChapterAudioPreset[] = CHAPTER_IDS.map((id) => ({
  id,
  bedSrc: AUDIO.music[id],
}));
export interface ChapterMusicState {
  readonly chapterIndex: number;
  readonly chapterLocal: number;
}
let muted = true;
let lastState: ChapterMusicState = { chapterIndex: 0, chapterLocal: 0 };
let activeChapterIndex = -1;
function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}
function sceneIntensity(chapterIndex: number, local: number): number {
  const l = clamp01(local);
  switch (chapterIndex) {
    case 0:
      return (
        0.88 +
        0.12 * smoothstep(clamp01((l - 0.34) / 0.12)) * (1 - smoothstep(clamp01((l - 0.52) / 0.14)))
      );
    case 1:
      return 0.85 + 0.15 * smoothstep(l * 1.05);
    case 2:
      return 0.85 + 0.15 * (0.5 + 0.5 * Math.sin(l * Math.PI * 3.2));
    case 3:
      return 0.82 + 0.18 * smoothstep(clamp01((l - 0.2) / 0.55));
    case 4: {
      const metaT = smoothstep(clamp01((l - 0.4) / 0.55));
      return 1 - metaT * 0.3;
    }
    default:
      return 1;
  }
}
function startChapterBed(index: number): boolean {
  const preset = CHAPTER_AUDIO[index];
  if (!preset) return false;
  if (musicBed.playFromGesture(preset.bedSrc)) {
    activeChapterIndex = index;
    musicBed.setIntensity(sceneIntensity(index, lastState.chapterLocal));
    return true;
  }
  return false;
}
async function ensureChapterBed(index: number): Promise<void> {
  if (muted) return;
  if (index === activeChapterIndex) {
    musicBed.setIntensity(sceneIntensity(index, lastState.chapterLocal));
    return;
  }
  if (startChapterBed(index)) return;
  const preset = CHAPTER_AUDIO[index];
  if (!preset) return;
  const ok = await musicBed.play(preset.bedSrc);
  if (ok) {
    activeChapterIndex = index;
    musicBed.setIntensity(sceneIntensity(index, lastState.chapterLocal));
  }
}
export function syncChapterMusic(state: ChapterMusicState): void {
  const prevIndex = lastState.chapterIndex;
  lastState = state;
  if (muted) return;
  const idx = Math.min(CHAPTER_AUDIO.length - 1, Math.max(0, state.chapterIndex));
  if (idx !== prevIndex) {
    unlockAudioEngine();
    void ensureChapterBed(idx);
    return;
  }
  if (activeChapterIndex === idx) {
    musicBed.setIntensity(sceneIntensity(idx, state.chapterLocal));
  }
}
export function setChapterAudioMuted(value: boolean): void {
  muted = value;
  setAudioMuted(value);
  activeChapterIndex = -1;
  if (!muted) {
    void ensureChapterBed(Math.min(CHAPTER_AUDIO.length - 1, Math.max(0, lastState.chapterIndex)));
  }
}
export function setChapterMusicVolume(value: number): void {
  setAudioMasterVolume(value);
}
export function crossfadeChapterMusic(chapterId: string): void {
  const idx = CHAPTER_AUDIO.findIndex((c) => c.id === chapterId);
  if (idx < 0) return;
  syncChapterMusic({ chapterIndex: idx, chapterLocal: 0.5 });
}
export function stopChapterMusic(): void {
  musicBed.stop();
  activeChapterIndex = -1;
}
export function unlockChapterAudio(): void {
  unlockAudioEngine();
  if (muted || activeChapterIndex >= 0) return;
  const idx = Math.min(CHAPTER_AUDIO.length - 1, Math.max(0, lastState.chapterIndex));
  if (!startChapterBed(idx)) void ensureChapterBed(idx);
}
onAudioUnlock(() => {
  if (muted || activeChapterIndex >= 0) return;
  const idx = Math.min(CHAPTER_AUDIO.length - 1, Math.max(0, lastState.chapterIndex));
  if (!startChapterBed(idx)) void ensureChapterBed(idx);
});
