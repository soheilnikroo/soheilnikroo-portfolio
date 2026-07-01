import { site } from "@/lib/config/site";
import { getAllPostMeta } from "@/lib/data";

export const revalidate = 60;
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
export async function GET() {
  const posts = await getAllPostMeta().catch(() => []);
  const items = posts
    .map((p) => {
      const url = `${site.url}/blog/${p.slug}`;
      const date = new Date(`${p.date}T00:00:00Z`).toUTCString();
      return `<item><title>${esc(p.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${date}</pubDate><description>${esc(p.description)}</description></item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(site.name)}</title><link>${site.url}</link><description>${esc(site.description)}</description>${items}</channel></rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
