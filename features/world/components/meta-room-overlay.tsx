"use client";

import Link from "next/link";
import * as React from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { StoryBeat } from "@/lib/schemas/world-narrative";
import {
  buildMetaOverlayBeats,
  metaBeatPop,
  metaCtaPanelOpacity,
  resolveMetaOverlayBeat,
} from "@/lib/world/meta-room-copy";

import { MetaEasterEgg } from "./meta-easter-egg";

export interface MetaRoomOverlayProps {
  readonly metaReveal: number;
  readonly contactBeats: readonly StoryBeat[];
  readonly email: string;
  readonly resumeUrl?: string;
  readonly socials: readonly { label: string; href: string }[];
  readonly onDownloadResume: () => void;
  readonly metaEasterEggVisible: boolean;
  readonly metaSecretRevealed: boolean;
  readonly onRevealSecret: () => void;
  readonly onDismissSecret: () => void;
}

export function MetaRoomOverlay({
  metaReveal,
  contactBeats,
  email,
  resumeUrl,
  socials,
  onDownloadResume,
  metaEasterEggVisible,
  metaSecretRevealed,
  onRevealSecret,
  onDismissSecret,
}: MetaRoomOverlayProps): React.ReactElement | null {
  const reduced = useReducedMotion();
  const beats = React.useMemo(() => buildMetaOverlayBeats(contactBeats), [contactBeats]);
  const activeBeat = resolveMetaOverlayBeat(metaReveal, beats);
  const beatPop = metaBeatPop(metaReveal, activeBeat);
  const ctaOpacity = metaCtaPanelOpacity(metaReveal);

  if (metaReveal < 0.36) return null;

  const beatKey = activeBeat ? `${activeBeat.at}-${activeBeat.title}` : "none";

  return (
    <div className="pointer-events-none absolute inset-0 z-[18]">
      {activeBeat && beatPop > 0.02 ? (
        <div
          className="absolute inset-x-0 top-[10%] flex justify-center px-3 sm:top-[12%] sm:px-6"
          style={{ opacity: beatPop }}
        >
          <div
            key={beatKey}
            className={
              reduced
                ? "w-full max-w-xl"
                : "meta-beat-pop w-full max-w-xl animate-[metaBeatPop_0.55s_ease-out_both]"
            }
          >
            <div className="border-4 border-indigo-300/90 bg-[#0d0b16]/94 px-4 py-3 shadow-[4px_4px_0_#000,0_0_28px_rgba(129,140,248,0.2)] sm:px-5 sm:py-4">
              {activeBeat.kicker ? (
                <p className="[font-family:var(--font-pixel),monospace] text-[10px] font-bold tracking-[0.22em] text-indigo-300 uppercase sm:text-xs">
                  {activeBeat.kicker}
                </p>
              ) : null}
              <p className="mt-1 [font-family:var(--font-pixel),monospace] text-base leading-snug font-bold text-white [text-shadow:2px_2px_0_#000] sm:text-lg">
                {activeBeat.title}
              </p>
              {activeBeat.body ? (
                <p className="mt-1.5 [font-family:var(--font-pixel),monospace] text-xs leading-relaxed text-white/72 sm:text-sm">
                  {activeBeat.body}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {ctaOpacity > 0.04 ? (
        <div
          className="pointer-events-auto absolute inset-x-0 bottom-0 px-2 pb-2 sm:px-4"
          style={{ opacity: ctaOpacity }}
        >
          <div
            className={
              reduced
                ? "mx-auto w-full max-w-[min(56rem,99%)]"
                : "meta-beat-pop mx-auto w-full max-w-[min(56rem,99%)] animate-[metaBeatPop_0.55s_ease-out_both]"
            }
          >
            <div className="border-4 border-white bg-[#0d0b16]/97 px-4 py-4 [font-family:var(--font-pixel),monospace] shadow-[4px_4px_0_#000] sm:px-6">
              <p className="text-base leading-snug font-bold text-white [text-shadow:2px_2px_0_#000] sm:text-lg">
                Life is a lot like a game — it all depends on how you play it.
              </p>
              <p className="mt-1.5 text-sm text-white/70">Thanks for playing through mine.</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm sm:gap-3">
                <a
                  href={`mailto:${email}`}
                  className="inline-flex min-h-11 items-center border-4 border-indigo-300 bg-indigo-950 px-4 py-2 font-bold text-indigo-50 shadow-[3px_3px_0_#000] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                >
                  Say hello →
                </a>
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center border-4 border-white/55 bg-[#0d0b16] px-3 py-2 font-bold text-white/90 shadow-[3px_3px_0_#000] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  >
                    {s.label}
                  </a>
                ))}
                {resumeUrl ? (
                  <button
                    type="button"
                    onClick={onDownloadResume}
                    className="inline-flex min-h-11 items-center border-4 border-amber-300 bg-amber-950 px-4 py-2 font-bold text-amber-50 shadow-[3px_3px_0_#000] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  >
                    Résumé PDF
                  </button>
                ) : null}
                <Link
                  href="/read"
                  className="inline-flex min-h-11 items-center border-4 border-white/50 bg-[#0d0b16] px-4 py-2 font-bold text-white/90 shadow-[3px_3px_0_#000] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                >
                  Read as a page
                </Link>
              </div>
              <MetaEasterEgg
                visible={metaEasterEggVisible}
                revealed={metaSecretRevealed}
                onReveal={onRevealSecret}
                onDismiss={onDismissSecret}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
