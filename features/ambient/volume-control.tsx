"use client";
import { Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

import { ElasticSlider } from "@/components/reactbits/elastic-slider";
import { Button } from "@/components/ui/button";

import { useAmbient } from "./ambient-provider";

export function VolumeControl({ className }: { className?: string }) {
  const {
    soundEnabled,
    soundActive,
    reducedMotion,
    unsupported,
    volume,
    toggleSound,
    setVolume,
    cue,
  } = useAmbient();
  const [mobileSliderOpen, setMobileSliderOpen] = React.useState(false);
  const disabledByMotion = reducedMotion && !soundActive;
  const label = unsupported
    ? "Ambient sound is not supported in this browser"
    : reducedMotion
      ? "Ambient sound is off while Reduce Motion is enabled"
      : soundEnabled
        ? "Turn ambient sound off"
        : "Turn ambient sound on";
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-pressed={soundActive}
          aria-label={label}
          title={label}
          disabled={unsupported || disabledByMotion}
          onClick={() => {
            toggleSound();
            cue("select");
            if (soundActive) setMobileSliderOpen(false);
          }}
        >
          {soundActive ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
        </Button>
        {soundActive ? (
          <button
            type="button"
            className="rounded-[3px] border-2 border-pixel-border/40 px-2 py-1 text-[10px] tracking-[0.18em] text-pixel-fg-muted uppercase sm:hidden"
            aria-expanded={mobileSliderOpen}
            aria-label={mobileSliderOpen ? "Hide volume slider" : "Show volume slider"}
            onClick={() => setMobileSliderOpen((open) => !open)}
          >
            Vol
          </button>
        ) : null}
        <AnimatePresence initial={false}>
          {soundActive ? (
            <motion.div
              key="volume-slider"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
              className="hidden sm:block"
            >
              <ElasticSlider
                className="w-28"
                defaultValue={Math.round(volume * 100)}
                startingValue={0}
                maxValue={100}
                onChange={(v) => setVolume(v / 100)}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <AnimatePresence initial={false}>
        {soundActive && mobileSliderOpen ? (
          <motion.div
            key="mobile-volume-slider"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            className="overflow-hidden pt-2 sm:hidden"
          >
            <ElasticSlider
              className="w-full max-w-48"
              defaultValue={Math.round(volume * 100)}
              startingValue={0}
              maxValue={100}
              onChange={(v) => setVolume(v / 100)}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
