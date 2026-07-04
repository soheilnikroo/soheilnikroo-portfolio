"use client";
import Link from "next/link";
import * as React from "react";

import {
  PIXEL_CARD,
  PIXEL_GHOST_BTN,
  PIXEL_PRIMARY_BTN,
  PORTFOLIO_SHELL,
} from "@/lib/world/world-theme";

export default function Error({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section
      className={`flex min-h-[82vh] items-center justify-center px-6 text-center ${PORTFOLIO_SHELL}`}
    >
      <div className={`w-full max-w-lg border border-border p-8 ${PIXEL_CARD}`}>
        <p className="text-xs tracking-[0.3em] text-rose-600/80 uppercase dark:text-rose-300/80">
          System crash
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-5xl">
          Something went wrong
        </h1>
        <p className="mx-auto mt-4 max-w-[44ch] text-sm text-muted-foreground">
          Something broke while rendering this screen. Retry the level, or warp home.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-muted-foreground">ref: {error.digest}</p>
        ) : null}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={reset} className={PIXEL_PRIMARY_BTN}>
            ↻ Retry
          </button>
          <Link href="/" className={PIXEL_GHOST_BTN}>
            Back to start
          </Link>
        </div>
      </div>
    </section>
  );
}
