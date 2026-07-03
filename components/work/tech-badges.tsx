import { Globe, Layers, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";

import type { TechGlyph } from "@/lib/work/tech-registry";
import { resolveTech, techIconUrl } from "@/lib/work/tech-registry";

const GLYPHS: Record<TechGlyph, LucideIcon> = {
  message: MessageSquare,
  globe: Globe,
  layers: Layers,
};

function TechBadge({ name, size }: { name: string; size: "sm" | "md" }) {
  const tech = resolveTech(name);
  const isDarkIcon = tech.color.toLowerCase() === "#000000";
  const iconUrl = tech.icon ? techIconUrl(tech.icon, isDarkIcon ? "FFFFFF" : tech.color) : null;
  const Glyph = tech.glyph ? GLYPHS[tech.glyph] : null;
  const pad = size === "sm" ? "px-2 py-1 gap-1.5" : "px-2.5 py-1.5 gap-2";
  const text = size === "sm" ? "text-[10px]" : "text-xs";
  const iconBox = size === "sm" ? "size-4" : "size-5";
  const iconSize = size === "sm" ? "size-2.5" : "size-3.5";
  const abbr = (tech.abbr ?? tech.label).slice(0, 2).toUpperCase();

  return (
    <span
      className={`inline-flex items-center rounded-[6px] border ${pad} ${text} font-medium`}
      style={{
        borderColor: `${tech.color}44`,
        background: `linear-gradient(135deg, ${tech.color}14, transparent 72%)`,
        color: tech.color,
      }}
      title={tech.label}
    >
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-[4px] ${iconBox}`}
        style={{
          background: isDarkIcon ? "#18181b" : "#ffffff",
          boxShadow: `inset 0 0 0 1px ${tech.color}33`,
        }}
      >
        {iconUrl ? (
          <Image src={iconUrl} alt="" width={14} height={14} className={iconSize} unoptimized />
        ) : Glyph ? (
          <Glyph className={iconSize} style={{ color: tech.color }} aria-hidden />
        ) : (
          <span
            className={`leading-none font-bold tracking-tighter ${size === "sm" ? "text-[7px]" : "text-[8px]"}`}
          >
            {abbr}
          </span>
        )}
      </span>
      <span className="text-pixel-fg">{tech.label}</span>
    </span>
  );
}

export function TechBadges({
  items,
  size = "md",
  limit,
}: {
  items: string[];
  size?: "sm" | "md";
  limit?: number;
}) {
  const visible = limit ? items.slice(0, limit) : items;
  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((name) => (
        <TechBadge key={name} name={name} size={size} />
      ))}
    </div>
  );
}
