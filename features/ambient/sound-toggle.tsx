"use client";

import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useAmbient } from "./ambient-provider";

/** Accessible opt-in control for the ambient audio bed + interaction cues. */
export function SoundToggle({ className }: { className?: string }) {
  const { soundEnabled, soundActive, reducedMotion, unsupported, toggleSound, cue } = useAmbient();

  const disabledByMotion = reducedMotion && !soundActive;
  const label = unsupported
    ? "Ambient sound is not supported in this browser"
    : reducedMotion
      ? "Ambient sound is off while Reduce Motion is enabled"
      : soundEnabled
        ? "Turn ambient sound off"
        : "Turn ambient sound on";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      aria-pressed={soundActive}
      aria-label={label}
      title={label}
      disabled={unsupported || disabledByMotion}
      onClick={() => {
        toggleSound();
        cue("select");
      }}
    >
      {soundActive ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
    </Button>
  );
}
