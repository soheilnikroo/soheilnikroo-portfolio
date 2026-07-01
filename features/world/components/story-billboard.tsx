import type { ReactNode } from "react";

export type BillboardAccent = "indigo" | "amber" | "emerald" | "cyan" | "white";
const STYLES: Record<
  BillboardAccent,
  {
    border: string;
    kicker: string;
    panel: string;
    glow: string;
  }
> = {
  indigo: {
    border: "border-indigo-300/80",
    kicker: "text-indigo-300",
    panel: "bg-[#0a0818]/94",
    glow: "shadow-[0_0_36px_rgba(129,140,248,0.35),6px_6px_0_rgba(0,0,0,0.75)]",
  },
  amber: {
    border: "border-amber-300/85",
    kicker: "text-amber-300",
    panel: "bg-[#14100c]/94",
    glow: "shadow-[0_0_36px_rgba(251,191,36,0.3),6px_6px_0_rgba(0,0,0,0.75)]",
  },
  emerald: {
    border: "border-emerald-300/80",
    kicker: "text-emerald-300",
    panel: "bg-[#061410]/94",
    glow: "shadow-[0_0_36px_rgba(52,211,153,0.32),6px_6px_0_rgba(0,0,0,0.75)]",
  },
  cyan: {
    border: "border-cyan-300/80",
    kicker: "text-cyan-300",
    panel: "bg-[#081018]/94",
    glow: "shadow-[0_0_36px_rgba(34,211,238,0.28),6px_6px_0_rgba(0,0,0,0.75)]",
  },
  white: {
    border: "border-white/90",
    kicker: "text-white/70",
    panel: "bg-[#0d0b16]/95",
    glow: "shadow-[0_0_28px_rgba(255,255,255,0.12),6px_6px_0_rgba(0,0,0,0.75)]",
  },
};
export interface StoryBillboardProps {
  readonly kicker?: string;
  readonly title: string;
  readonly body?: string;
  readonly accent?: BillboardAccent;
  readonly opacity: number;
  readonly scale?: number;
  readonly y?: number;
  readonly dotCount?: number;
  readonly dotIndex?: number;
  readonly action?: ReactNode;
  readonly className?: string;
  readonly position?: "top" | "bottom";
  readonly compact?: boolean;
}
export function StoryBillboard({
  kicker,
  title,
  body,
  accent = "indigo",
  opacity,
  scale = 1,
  y = 0,
  dotCount,
  dotIndex,
  action,
  className = "",
  position = "top",
  compact = false,
}: StoryBillboardProps) {
  if (opacity <= 0.03) return null;
  const s = STYLES[accent];
  const posClass =
    position === "bottom" ? "top-auto bottom-[4%]" : compact ? "top-[8%]" : "top-[11%]";
  const panelBg = compact ? s.panel.replace("/94", "/72").replace("/95", "/72") : s.panel;
  const glow = compact ? "shadow-[4px_4px_0_rgba(0,0,0,0.65)]" : s.glow;
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-30 flex justify-center px-3 sm:px-5 ${posClass} ${className}`}
      style={{ opacity }}
    >
      {!compact ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -top-[20%] bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(5,4,11,0.55)_100%)]"
          style={{ opacity: opacity * 0.85 }}
        />
      ) : null}
      <div
        className={`pointer-events-auto relative w-full rounded-[6px] border-4 text-center ${compact ? "max-w-[min(18rem,88%)] px-4 py-3" : "max-w-[min(24rem,92%)] px-5 py-4 sm:px-6 sm:py-5"} ${s.border} ${panelBg} ${glow}`}
        style={{
          transform: `translateY(${y}px) scale(${scale})`,
          transition: "transform 0.14s linear",
        }}
      >
        {kicker ? (
          <p
            className={`tracking-[0.32em] uppercase ${compact ? "text-[9px]" : "text-[10px] sm:text-xs"} ${s.kicker}`}
          >
            {kicker}
          </p>
        ) : null}
        <h2
          className={`mt-1 leading-tight font-black [text-shadow:2px_2px_0_#000] ${compact ? "text-base sm:text-lg" : "text-lg sm:text-2xl"}`}
        >
          {title}
        </h2>
        {body && !compact ? (
          <p className="mx-auto mt-2.5 max-w-[20rem] text-sm leading-relaxed text-white/75 sm:text-base">
            {body}
          </p>
        ) : null}
        {body && compact ? (
          <p className="mx-auto mt-1 line-clamp-2 text-xs leading-relaxed text-white/65">{body}</p>
        ) : null}
        {action ? <div className={compact ? "mt-2.5" : "mt-4"}>{action}</div> : null}
        {dotCount !== undefined && dotCount > 1 ? (
          <div
            className={`flex justify-center gap-2 ${compact ? "mt-2.5" : "mt-4"}`}
            aria-hidden="true"
          >
            {Array.from({ length: dotCount }, (_, i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-[1px] border border-white/25 transition-all duration-200"
                style={{
                  backgroundColor:
                    i === dotIndex ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                  transform: i === dotIndex ? "scale(1.15)" : "scale(1)",
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
