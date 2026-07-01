"use client";
import { usePathname } from "next/navigation";
import * as React from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { CONTENT_MUSIC_BED, isContentMusicRoute } from "@/lib/audio/content-routes";
import { unlockAudioEngine } from "@/lib/audio/html-audio";
import { createAmbientAudio } from "@/lib/services";
import type { AmbientAudioController, AmbientCue } from "@/lib/services";
import { stopChapterMusic } from "@/lib/world/chapter-audio";

const STORAGE_KEY = "portfolio:ambient-sound";
const VOLUME_KEY = "portfolio:ambient-volume";
const DEFAULT_VOLUME = 0.55;
function readSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}
function readVolume(): number {
  if (typeof window === "undefined") return DEFAULT_VOLUME;
  try {
    const stored = Number(window.localStorage.getItem(VOLUME_KEY));
    if (Number.isFinite(stored) && stored >= 0 && stored <= 1) return stored;
  } catch {}
  return DEFAULT_VOLUME;
}
type AmbientContextValue = {
  soundEnabled: boolean;
  soundActive: boolean;
  unsupported: boolean;
  reducedMotion: boolean;
  volume: number;
  toggleSound: () => void;
  setVolume: (volume: number) => void;
  setBedSuppressed: (suppressed: boolean) => void;
  cue: (cue: AmbientCue) => void;
};
const AmbientContext = React.createContext<AmbientContextValue>({
  soundEnabled: true,
  soundActive: false,
  unsupported: true,
  reducedMotion: false,
  volume: DEFAULT_VOLUME,
  toggleSound: () => {},
  setVolume: () => {},
  setBedSuppressed: () => {},
  cue: () => {},
});
export function AmbientProvider({
  children,
  bedSrc,
}: {
  children: React.ReactNode;
  bedSrc?: string;
}) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const isGameRoute = pathname === "/";
  const contentMusicRoute = isContentMusicRoute(pathname);
  const activeBedSrc = contentMusicRoute ? CONTENT_MUSIC_BED : bedSrc;
  const [soundEnabled, setSoundEnabled] = React.useState(readSoundEnabled);
  const [volume, setVolumeState] = React.useState(readVolume);
  const [bedSuppressed, setBedSuppressed] = React.useState(isGameRoute);
  const [controller, setController] = React.useState<AmbientAudioController | null>(null);
  React.useEffect(() => {
    setBedSuppressed(isGameRoute);
  }, [isGameRoute]);
  React.useEffect(() => {
    if (contentMusicRoute) stopChapterMusic();
  }, [contentMusicRoute]);
  React.useEffect(() => {
    const instance = createAmbientAudio(activeBedSrc ? { bedSrc: activeBedSrc } : undefined);
    setController(instance);
    return () => instance.dispose();
  }, [activeBedSrc]);
  const supported = controller?.supported ?? false;
  const unsupported = !supported;
  const soundActive = soundEnabled && !reducedMotion && supported && !bedSuppressed && !isGameRoute;
  React.useEffect(() => {
    if (!controller) return;
    if (soundActive) {
      void controller.play();
    } else {
      controller.pause();
    }
  }, [controller, soundActive]);
  React.useEffect(() => {
    controller?.setVolume(volume);
  }, [controller, volume]);
  const toggleSound = React.useCallback(() => {
    unlockAudioEngine();
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      } catch {}
      return next;
    });
  }, []);
  const setVolume = React.useCallback((next: number) => {
    const clamped = Math.min(1, Math.max(0, next));
    setVolumeState(clamped);
    try {
      window.localStorage.setItem(VOLUME_KEY, String(clamped));
    } catch {}
  }, []);
  const cue = React.useCallback(
    (c: AmbientCue) => {
      if (soundEnabled) controller?.cue(c);
    },
    [controller, soundEnabled],
  );
  const setBedSuppressedStable = React.useCallback((suppressed: boolean) => {
    setBedSuppressed(suppressed);
  }, []);
  const value = React.useMemo<AmbientContextValue>(
    () => ({
      soundEnabled,
      soundActive,
      unsupported,
      reducedMotion,
      volume,
      toggleSound,
      setVolume,
      setBedSuppressed: setBedSuppressedStable,
      cue,
    }),
    [
      soundEnabled,
      soundActive,
      unsupported,
      reducedMotion,
      volume,
      toggleSound,
      setVolume,
      setBedSuppressedStable,
      cue,
    ],
  );
  return <AmbientContext.Provider value={value}>{children}</AmbientContext.Provider>;
}
export function useAmbient(): AmbientContextValue {
  return React.useContext(AmbientContext);
}
