/** PostgreSQL text[] literal for Supabase transaction pooler (prepare: false). */
export function pgTextArrayLiteral(values: readonly string[]): string {
  if (values.length === 0) return "{}";
  return `{${values
    .map((value) => `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
    .join(",")}}`;
}

/** Use in tagged templates: tags = ${sqlTextArray(tags)}::text[] */
export function sqlTextArray(values: readonly string[]): string {
  return pgTextArrayLiteral(values);
}

/** Coerce text[] from Postgres (handles fetch_types: false and legacy bad rows). */
export function normalizeTextArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value !== "string") return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];

    const items: string[] = [];
    let current = "";
    let inQuote = false;
    for (let i = 0; i < inner.length; i += 1) {
      const ch = inner[i];
      if (ch === '"' && inner[i - 1] !== "\\") {
        inQuote = !inQuote;
        continue;
      }
      if (ch === "," && !inQuote) {
        if (current.trim()) items.push(current.trim());
        current = "";
        continue;
      }
      current += ch;
    }
    if (current.trim()) items.push(current.trim());

    return items.map((item) => item.replace(/\\"/g, '"').replace(/\\\\/g, "\\")).filter(Boolean);
  }

  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
