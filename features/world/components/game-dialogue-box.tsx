"use client";
import Image from "next/image";
import type { ReactNode } from "react";
import * as React from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

import type { BillboardAccent } from "./story-billboard";

const STYLES: Record<
  BillboardAccent,
  {
    border: string;
    kicker: string;
    panel: string;
    glow: string;
    accent: string;
  }
> = {
  indigo: {
    border: "border-indigo-400",
    kicker: "text-indigo-300",
    panel: "bg-[#0a0818]/96",
    glow: "shadow-[4px_4px_0_#000,0_0_24px_rgba(129,140,248,0.25)]",
    accent: "#a5b4fc",
  },
  amber: {
    border: "border-amber-400",
    kicker: "text-amber-300",
    panel: "bg-[#14100c]/96",
    glow: "shadow-[4px_4px_0_#000,0_0_24px_rgba(251,191,36,0.22)]",
    accent: "#fcd34d",
  },
  emerald: {
    border: "border-emerald-400",
    kicker: "text-emerald-300",
    panel: "bg-[#061410]/96",
    glow: "shadow-[4px_4px_0_#000,0_0_24px_rgba(52,211,153,0.22)]",
    accent: "#6ee7b7",
  },
  cyan: {
    border: "border-cyan-400",
    kicker: "text-cyan-300",
    panel: "bg-[#081018]/96",
    glow: "shadow-[4px_4px_0_#000,0_0_24px_rgba(34,211,238,0.2)]",
    accent: "#67e8f9",
  },
  white: {
    border: "border-white",
    kicker: "text-white/80",
    panel: "bg-[#0d0b16]/97",
    glow: "shadow-[4px_4px_0_#000,0_0_20px_rgba(255,255,255,0.1)]",
    accent: "#ffffff",
  },
};
const PORTRAIT_SRC = "/world/character/idle/east/0.png";
export function renderHighlightedBody(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
export interface GameDialogueBoxProps {
  readonly speaker?: string;
  readonly kicker?: string;
  readonly title: string;
  readonly body?: string;
  readonly hook?: string;
  readonly cta?: string;
  readonly accent?: BillboardAccent;
  readonly opacity: number;
  readonly dotCount?: number;
  readonly dotIndex?: number;
  readonly action?: ReactNode;
  readonly beatKey?: string;
  readonly onBeatComplete?: () => void;
  readonly compact?: boolean;
  readonly gate?: boolean;
}
export function GameDialogueBox({
  speaker,
  kicker,
  title,
  body,
  hook,
  cta,
  accent = "indigo",
  opacity,
  dotCount,
  dotIndex,
  action,
  beatKey = "",
  onBeatComplete,
  compact = false,
  gate = false,
}: GameDialogueBoxProps) {
  const reduced = useReducedMotion();
  const s = STYLES[accent];
  const fullText = [title, hook, body, cta].filter(Boolean).join(" ");
  const [displayed, setDisplayed] = React.useState(reduced ? fullText : "");
  const liveRef = React.useRef<HTMLParagraphElement>(null);
  const firedRef = React.useRef("");
  React.useEffect(() => {
    if (liveRef.current) liveRef.current.textContent = fullText;
  }, [fullText]);
  React.useEffect(() => {
    if (reduced) {
      setDisplayed(fullText);
      return;
    }
    setDisplayed("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setDisplayed(fullText.slice(0, i));
      if (i >= fullText.length) {
        window.clearInterval(id);
        if (firedRef.current !== beatKey) {
          firedRef.current = beatKey;
          onBeatComplete?.();
        }
      }
    }, 18);
    return () => window.clearInterval(id);
  }, [beatKey, fullText, reduced, onBeatComplete]);
  if (opacity <= 0.03) return null;
  const showHook = hook && displayed.length > title.length;
  const showBody =
    body && displayed.length > title.length + (hook?.length ?? 0) + (showHook ? 1 : 0);
  const hasAction = Boolean(action);
  const maxH = gate
    ? hasAction
      ? "max-h-[min(34dvh,34vh)] sm:max-h-[min(18dvh,18vh)]"
      : "max-h-[min(28dvh,28vh)] sm:max-h-[min(18dvh,18vh)]"
    : compact
      ? hasAction
        ? "max-h-[min(38dvh,38vh)] sm:max-h-[min(24dvh,24vh)]"
        : "max-h-[min(32dvh,32vh)] sm:max-h-[min(24dvh,24vh)]"
      : hasAction
        ? "max-h-[min(42dvh,42vh)] sm:max-h-[min(30dvh,30vh)]"
        : "max-h-[min(34dvh,34vh)] sm:max-h-[min(30dvh,30vh)]";
  const portraitSize = gate
    ? "size-11 sm:size-16"
    : compact
      ? "size-12 sm:size-[4.25rem]"
      : "size-12 sm:size-20";
  const gradientH = gate ? "h-[22%] sm:h-[28%]" : "h-[30%] sm:h-[38%]";
  return (
    <section
      aria-label={speaker ? `Dialogue from ${speaker}` : "Story dialogue"}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] sm:px-2"
      style={{ opacity }}
    >
      <p ref={liveRef} aria-live="polite" className="sr-only">
        {fullText}
      </p>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#05040b]/85 to-transparent ${gradientH}`}
      />
      <div
        className={`pointer-events-auto relative flex w-full max-w-[min(56rem,99%)] touch-pan-y flex-col overflow-hidden border-4 ${s.border} ${s.panel} ${s.glow} ${maxH}`}
        style={{ imageRendering: "pixelated" }}
      >
        <div className="flex min-h-0 flex-1">
          <div
            aria-hidden="true"
            className="relative shrink-0 border-r-4 border-black/40 bg-[#0a0818]/90 p-1 sm:p-2"
          >
            <div
              className={`relative overflow-hidden border-4 border-white/30 bg-[#1a1830] ${portraitSize}`}
            >
              <Image
                src={PORTRAIT_SRC}
                alt=""
                width={68}
                height={68}
                loading="eager"
                className="absolute -top-1 left-1/2 h-[130%] w-auto max-w-none -translate-x-1/2 object-cover object-[center_15%]"
                style={{ imageRendering: "pixelated" }}
                unoptimized
              />
            </div>
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2.5 py-1.5 sm:px-4 sm:py-2.5">
              {speaker ? (
                <p
                  className={`text-[10px] font-bold tracking-[0.16em] uppercase sm:text-xs sm:tracking-[0.2em] ${s.kicker}`}
                >
                  {speaker}
                </p>
              ) : null}
              {kicker ? (
                <p
                  className={`mt-0.5 text-[10px] font-semibold tracking-[0.14em] uppercase sm:text-xs sm:tracking-[0.18em] ${s.kicker}`}
                >
                  {kicker}
                </p>
              ) : null}
              <h2 className="mt-0.5 text-sm leading-snug font-bold text-white [text-shadow:2px_2px_0_#000] sm:mt-1 sm:text-lg md:text-xl">
                {renderHighlightedBody(
                  displayed.slice(0, title.length) || title.slice(0, displayed.length),
                )}
              </h2>
              {hook ? (
                <p className="mt-1 text-sm leading-relaxed font-medium text-white/95 [text-shadow:1px_1px_0_#000] sm:mt-1.5 sm:text-base sm:leading-[1.7]">
                  {showHook
                    ? renderHighlightedBody(
                        displayed.slice(title.length).slice(0, hook.length) ||
                          hook.slice(0, Math.max(0, displayed.length - title.length)),
                      )
                    : null}
                </p>
              ) : null}
              {body ? (
                <p
                  className={`mt-1.5 text-sm leading-relaxed font-medium text-white/95 [text-shadow:1px_1px_0_#000] sm:mt-2 sm:text-base sm:leading-[1.7] ${gate ? "line-clamp-2 sm:line-clamp-2" : compact ? "line-clamp-2 sm:line-clamp-2" : "line-clamp-3 sm:line-clamp-3"}`}
                >
                  {showBody
                    ? renderHighlightedBody(
                        displayed.slice(title.length + (hook?.length ?? 0) + (hook ? 1 : 0)),
                      )
                    : null}
                </p>
              ) : null}
              {cta && displayed.length >= fullText.length - cta.length ? (
                <p className="mt-1.5 text-xs font-bold tracking-wide text-amber-200 sm:mt-2 sm:text-base">
                  {cta}
                </p>
              ) : null}
              {dotCount !== undefined && dotCount > 1 ? (
                <div className="mt-1.5 flex gap-2 sm:mt-2" aria-hidden="true">
                  {Array.from({ length: dotCount }, (_, i) => (
                    <span
                      key={i}
                      className="size-2 border-2 border-black/50 sm:size-2.5"
                      style={{
                        backgroundColor: i === dotIndex ? s.accent : "rgba(255,255,255,0.12)",
                      }}
                    />
                  ))}
                </div>
              ) : null}
            </div>
            {action ? (
              <div className="shrink-0 border-t-4 border-black/30 bg-[#0a0818]/80 px-2.5 py-2 sm:px-4 sm:py-2.5">
                <div className="max-sm:[&_a]:block max-sm:[&_a]:w-full max-sm:[&_a]:text-center max-sm:[&_button]:w-full max-sm:[&_button]:justify-center">
                  {action}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
