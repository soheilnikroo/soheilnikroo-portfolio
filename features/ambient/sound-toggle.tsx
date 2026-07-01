"use client";
import { Volume2, VolumeX } from "lucide-react";

import { useAmbient } from "./ambient-provider";

export function SoundToggle({ className }: { className?: string }) {
  const { soundEnabled, reducedMotion, unsupported, toggleSound, cue } = useAmbient();
  const disabledByMotion = reducedMotion;
  const label = unsupported
    ? "Ambient sound is not supported in this browser"
    : reducedMotion
      ? "Ambient sound is off while Reduce Motion is enabled"
      : soundEnabled
        ? "Turn sound off"
        : "Turn sound on";
  return (
    <button
      type="button"
      className={className}
      aria-pressed={soundEnabled}
      aria-label={label}
      title={label}
      disabled={unsupported || disabledByMotion}
      onClick={() => {
        toggleSound();
        cue("select");
      }}
    >
      {soundEnabled ? (
        <Volume2 className="size-4" aria-hidden="true" />
      ) : (
        <VolumeX className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
