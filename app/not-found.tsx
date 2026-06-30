import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="flex min-h-[82vh] items-center justify-center bg-[#05040b] px-6 text-center [font-family:var(--font-pixel),ui-monospace,monospace] text-white">
      <div className="w-full max-w-lg rounded-[6px] border-4 border-white/20 bg-[#0d0b16] p-8 shadow-[6px_6px_0_rgba(0,0,0,0.6)]">
        <p className="text-xs tracking-[0.3em] text-amber-300/80 uppercase">Game over</p>
        <p className="mt-3 text-7xl font-black text-white [text-shadow:4px_4px_0_#000] sm:text-8xl">
          404
        </p>
        <h1 className="mt-3 text-xl font-bold">You wandered off the map.</h1>
        <p className="mx-auto mt-3 max-w-[42ch] text-sm text-white/60">
          This screen is not part of the world. Warp back and keep playing.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-[3px] border-2 border-black bg-[#6366f1] px-5 py-2.5 text-sm text-white shadow-[3px_3px_0_#000] transition-transform hover:-translate-y-0.5"
          >
            ↩ Back to start
          </Link>
          <Link
            href="/blog"
            className="rounded-[3px] border-2 border-white/30 px-5 py-2.5 text-sm text-white/80 shadow-[3px_3px_0_rgba(0,0,0,0.5)] transition-colors hover:border-white/60"
          >
            Read the log
          </Link>
        </div>
      </div>
    </section>
  );
}
