"use client";

import { usePathname } from "next/navigation";

export function SkipToContent({ label }: { label: string }) {
  const pathname = usePathname();
  const href = pathname === "/" ? "/read" : "#main";

  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[var(--z-toast)] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:ring-3 focus:ring-ring/50"
    >
      {label}
    </a>
  );
}
