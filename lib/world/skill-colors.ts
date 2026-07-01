const SKILL_COLORS: Record<string, string> = {
  language: "#6aa0ff",
  framework: "#c79bff",
  design: "#ff8fb0",
  tooling: "#ffd76a",
  practice: "#7ad17a",
  platform: "#5fd0d6",
};
export function categoryColor(category: string): string {
  return SKILL_COLORS[category] ?? "#a5b4fc";
}
