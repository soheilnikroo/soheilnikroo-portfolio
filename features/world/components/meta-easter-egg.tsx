"use client";
import * as React from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { sfx, unlockAudio } from "@/lib/world/audio";

export interface MetaEasterEggProps {
  readonly visible: boolean;
  readonly revealed: boolean;
  readonly onReveal: () => void;
  readonly onDismiss: () => void;
}
export function MetaEasterEgg({
  visible,
  revealed,
  onReveal,
  onDismiss,
}: MetaEasterEggProps): React.ReactElement | null {
  const reduced = useReducedMotion();
  const [showAnswer, setShowAnswer] = React.useState(false);
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (revealed && !dialog.open) dialog.showModal();
    if (!revealed && dialog.open) dialog.close();
  }, [revealed]);
  React.useEffect(() => {
    if (!revealed) {
      setShowAnswer(false);
      return;
    }
    if (reduced) {
      setShowAnswer(true);
      return;
    }
    const id = window.setTimeout(() => setShowAnswer(true), 120);
    return () => window.clearTimeout(id);
  }, [revealed, reduced]);
  const handleAsk = (): void => {
    unlockAudio();
    sfx.reveal();
    onReveal();
  };
  if (!visible && !revealed) return null;
  return (
    <>
      {visible && !revealed ? (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleAsk}
          className="group mt-2.5 w-full border-4 border-dashed border-white/25 bg-white/3 px-3 py-2 text-left transition-colors hover:border-indigo-300/60 hover:bg-indigo-950/40 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:mt-4 sm:px-4 sm:py-3"
        >
          <span className="block [font-family:var(--font-pixel),monospace] text-[10px] font-bold tracking-wide text-indigo-200/90 uppercase sm:text-xs">
            Pause menu thought…
          </span>
          <span className="mt-1 block [font-family:var(--font-pixel),monospace] text-[11px] leading-snug text-white/85 group-hover:text-white sm:mt-1.5 sm:text-sm">
            I wish real life had a retry button. Did you scroll back to the start anyway?
          </span>
        </button>
      ) : null}

      {revealed ? (
        <dialog
          ref={dialogRef}
          className="pointer-events-auto m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-0 px-4 backdrop:bg-[#06050c]/88"
          aria-labelledby="meta-secret-title"
          onPointerDown={(e) => e.stopPropagation()}
          onCancel={(e) => {
            e.preventDefault();
            onDismiss();
          }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-[#06050c]/88 backdrop-blur-[2px]"
            onClick={onDismiss}
          />
          <div
            className={`relative z-10 w-full max-w-xl border-4 border-white bg-[#0d0b16] px-6 py-8 text-center [font-family:var(--font-pixel),monospace] shadow-[8px_8px_0_#000,0_0_48px_rgba(129,140,248,0.35)] sm:px-10 sm:py-10 ${showAnswer ? "animate-[metaSecretIn_0.55s_ease-out_both]" : "opacity-0"}`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-1 border border-indigo-400/30"
            />
            <p className="text-xs font-bold tracking-[0.2em] text-indigo-300 uppercase">
              Achievement unlocked
            </p>
            <h2
              id="meta-secret-title"
              className="mt-4 text-2xl leading-tight font-bold text-white [text-shadow:3px_3px_0_#000] sm:text-3xl"
            >
              Me too.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
              Games give you another run. Life only gives you the lesson — and the courage to try
              again.
            </p>
            <p className="mt-3 text-sm text-indigo-200/90">
              Glad you played through to the end. The save point is always right here.
            </p>
            <button
              type="button"
              onClick={onDismiss}
              className="mt-8 inline-flex min-h-11 items-center border-4 border-indigo-300 bg-indigo-950 px-5 py-2 text-sm font-bold text-indigo-50 shadow-[4px_4px_0_#000] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              Keep exploring →
            </button>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
