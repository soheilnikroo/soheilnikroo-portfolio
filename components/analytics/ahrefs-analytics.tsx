"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

import { getAhrefsDataKey, isAhrefsEnabled } from "@/lib/analytics/ahrefs";

const AHREFS_SCRIPT_ID = "ahrefs-analytics";
const AHREFS_SCRIPT_SRC = "https://analytics.ahrefs.com/analytics.js";

export function AhrefsAnalytics() {
  const pathname = usePathname();

  if (!isAhrefsEnabled()) return null;
  if (pathname.startsWith("/admin")) return null;

  const dataKey = getAhrefsDataKey();
  if (!dataKey) return null;

  return (
    <Script
      id={AHREFS_SCRIPT_ID}
      src={AHREFS_SCRIPT_SRC}
      strategy="afterInteractive"
      data-key={dataKey}
    />
  );
}
