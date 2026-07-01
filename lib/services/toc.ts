import GithubSlugger from "github-slugger";

export type TocItem = {
  depth: number;
  text: string;
  id: string;
};
export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inFence = false;
  for (const raw of markdown.split("\n")) {
    if (/^\s*```/.test(raw)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(raw);
    if (match) {
      const depth = (match[1] ?? "##").length;
      const text = (match[2] ?? "").replace(/[*_`]/g, "").trim();
      items.push({ depth, text, id: slugger.slug(text) });
    }
  }
  return items;
}
