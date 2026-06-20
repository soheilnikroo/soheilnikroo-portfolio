"use client";

import * as React from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { createAmbientAudio } from "@/lib/services";
import type { AmbientCue } from "@/lib/services";

const STORAGE_KEY = "portfolio:ambient-sound";

type AmbientContextValue = {
  /** User's sound preference (independent of whether it's currently audible). */
  soundEnabled: boolean;
  /** Whether sound can actually play right now (enabled AND motion allowed). */
  soundActive: boolean;
  /** Audio is unsupported (SSR/older browsers) — toggle should be disabled. */
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
  const controllerRef = React.useRef<ReturnType<typeof createAmbientAudio> | null>(null);

  // Lazily create the controller on the client only.
  if (controllerRef.current === null && typeof window !== "undefined") {
    controllerRef.current = createAmbientAudio({ bedSrc });
  }
  const controller = controllerRef.current;
  const unsupported = !controller?.supported;
  const soundActive = soundEnabled && !reducedMotion && !unsupported;

  // Restore persisted preference once mounted.
  React.useEffect(() => {
    try {
      setSoundEnabled(window.localStorage.getItem(STORAGE_KEY) === "on");
    } catch {
      // Storage unavailable (privacy mode) — keep default off.
    }
  }, []);

  // Reflect the effective state onto the controller.
  React.useEffect(() => {
    if (!controller) return;
    if (soundActive) {
      void controller.play();
    } else {
      controller.pause();
    }
  }, [controller, soundActive]);

  // Dispose on unmount.
  React.useEffect(() => {
    return () => {
      controllerRef.current?.dispose();
    };
  }, []);

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
