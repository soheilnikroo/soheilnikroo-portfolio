export type TechGlyph = "message" | "globe" | "layers";

export type TechDefinition = {
  label: string;
  color: string;
  icon?: string;
  abbr?: string;
  glyph?: TechGlyph;
};

const TECH: Record<string, TechDefinition> = {
  react: { label: "React", color: "#61DAFB", icon: "react" },
  "next.js": { label: "Next.js", color: "#000000", icon: "nextdotjs" },
  nextjs: { label: "Next.js", color: "#000000", icon: "nextdotjs" },
  typescript: { label: "TypeScript", color: "#3178C6", icon: "typescript" },
  "redux toolkit": { label: "Redux Toolkit", color: "#764ABC", icon: "redux" },
  redux: { label: "Redux", color: "#764ABC", icon: "redux" },
  swr: { label: "SWR", color: "#0070F3", icon: "vercel" },
  pwa: { label: "PWA", color: "#5A0FC8", glyph: "globe" },
  javascript: { label: "JavaScript", color: "#F7DF1E", icon: "javascript" },
  scss: { label: "SCSS", color: "#CC6699", icon: "sass" },
  sass: { label: "Sass", color: "#CC6699", icon: "sass" },
  jest: { label: "Jest", color: "#C21325", icon: "jest" },
  swift: { label: "Swift", color: "#F05138", icon: "swift" },
  swiftui: { label: "SwiftUI", color: "#F05138", icon: "swift" },
  mapkit: { label: "MapKit", color: "#555555", icon: "apple" },
  corelocation: { label: "CoreLocation", color: "#555555", icon: "apple" },
  xctest: { label: "XCTest", color: "#555555", abbr: "XC" },
  arkit: { label: "ARKit", color: "#555555", icon: "apple" },
  vision: { label: "Vision", color: "#555555", icon: "apple" },
  avfoundation: { label: "AVFoundation", color: "#555555", icon: "apple" },
  rust: { label: "Rust", color: "#DEA584", icon: "rust" },
  jira: { label: "JIRA", color: "#0052CC", icon: "jira" },
  communication: { label: "Communication", color: "#6366F1", glyph: "message" },
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function resolveTech(name: string): TechDefinition {
  const key = normalizeKey(name);
  const hit = TECH[key] ?? TECH[key.replace(/\s/g, "")];
  if (hit) return { ...hit, label: hit.label ?? name };
  return {
    label: name,
    color: "#94A3B8",
    abbr: name.slice(0, 2).toUpperCase(),
  };
}

export function techIconUrl(icon: string, color: string): string {
  const hex = color.replace("#", "");
  return `https://cdn.simpleicons.org/${icon}/${hex}`;
}
