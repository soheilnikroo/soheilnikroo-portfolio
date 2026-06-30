"use client";

import Link from "next/link";
import * as React from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[82vh] items-center justify-center bg-[#05040b] px-6 text-center [font-family:var(--font-pixel),ui-monospace,monospace] text-white">
      <div className="w-full max-w-lg rounded-[6px] border-4 border-rose-400/40 bg-[#0d0b16] p-8 shadow-[6px_6px_0_rgba(0,0,0,0.6)]">
        <p className="text-xs tracking-[0.3em] text-rose-300/80 uppercase">System crash</p>
        <h1 className="mt-3 text-3xl font-black [text-shadow:3px_3px_0_#000] sm:text-5xl">
          ! GLITCH !
        </h1>
        <p className="mx-auto mt-4 max-w-[44ch] text-sm text-white/60">
          Something broke while rendering this screen. Retry the level, or warp home.
        </p>
        {error.digest ? <p className="mt-3 text-xs text-white/40">ref: {error.digest}</p> : null}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-[3px] border-2 border-black bg-[#6366f1] px-5 py-2.5 text-sm text-white shadow-[3px_3px_0_#000] transition-transform hover:-translate-y-0.5"
          >
            ↻ Retry
          </button>
          <Link
            href="/"
            className="rounded-[3px] border-2 border-white/30 px-5 py-2.5 text-sm text-white/80 shadow-[3px_3px_0_rgba(0,0,0,0.5)] transition-colors hover:border-white/60"
          >
            Back to start
          </Link>
        </div>
      </div>
    </section>
  );
}
