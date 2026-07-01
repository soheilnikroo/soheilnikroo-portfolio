import { buildLlmsTxt } from "@/lib/seo/build-llms-txt";

export const revalidate = 300;

export async function GET() {
  const body = await buildLlmsTxt();
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
