"use client";

import * as React from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { createAmbientAudio } from "@/lib/services";
import type { AmbientAudioController, AmbientCue } from "@/lib/services";

const STORAGE_KEY = "portfolio:ambient-sound";

type AmbientContextValue = {
  soundEnabled: boolean;
  soundActive: boolean;
  unsupported: boolean;
  reducedMotion: boolean;
  toggleSound: () => void;
  cue: (cue: AmbientCue) => void;
};

const AmbientContext = React.createContext<AmbientContextValue>({
  soundEnabled: false,
  soundActive: false,
  unsupported: true,
  reducedMotion: false,
  toggleSound: () => {},
  cue: () => {},
});

export function AmbientProvider({
  children,
  bedSrc,
}: {
  children: React.ReactNode;
  bedSrc?: string;
}) {
  const reducedMotion = useReducedMotion();
  const [soundEnabled, setSoundEnabled] = React.useState(false);
  // `controller` starts null on both server and first client render → no hydration mismatch.
  const [controller, setController] = React.useState<AmbientAudioController | null>(null);

  React.useEffect(() => {
    const instance = createAmbientAudio(bedSrc ? { bedSrc } : undefined);
    setController(instance);
    try {
      setSoundEnabled(window.localStorage.getItem(STORAGE_KEY) === "on");
    } catch {
      // storage unavailable — keep default off
    }
    return () => instance.dispose();
  }, [bedSrc]);

  const supported = controller?.supported ?? false;
  const unsupported = !supported;
  const soundActive = soundEnabled && !reducedMotion && supported;

  React.useEffect(() => {
    if (!controller) return;
    if (soundActive) {
      void controller.play();
    } else {
      controller.pause();
    }
  }, [controller, soundActive]);

  const toggleSound = React.useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      } catch {
        // ignore persistence failures
      }
      return next;
    });
  }, []);

  const cue = React.useCallback(
    (c: AmbientCue) => {
      if (soundActive) controller?.cue(c);
    },
    [controller, soundActive],
  );

  const value = React.useMemo<AmbientContextValue>(
    () => ({ soundEnabled, soundActive, unsupported, reducedMotion, toggleSound, cue }),
    [soundEnabled, soundActive, unsupported, reducedMotion, toggleSound, cue],
  );

  return <AmbientContext.Provider value={value}>{children}</AmbientContext.Provider>;
}

export function useAmbient(): AmbientContextValue {
  return React.useContext(AmbientContext);
}
