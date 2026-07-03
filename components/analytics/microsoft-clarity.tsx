"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

import { getClarityProjectId, isClarityEnabled } from "@/lib/analytics/clarity";

const CLARITY_SCRIPT_ID = "microsoft-clarity";

function buildClarityInlineScript(projectId: string): string {
  return `(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "${projectId}");`;
}

export function MicrosoftClarity() {
  const pathname = usePathname();

  if (!isClarityEnabled()) return null;
  if (pathname.startsWith("/admin")) return null;

  const projectId = getClarityProjectId();
  if (!projectId) return null;

  return (
    <Script id={CLARITY_SCRIPT_ID} strategy="afterInteractive">
      {buildClarityInlineScript(projectId)}
    </Script>
  );
}
