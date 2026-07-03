"use client";

import * as React from "react";

function emailFromHref(href: string): string {
  return href.replace(/^mailto:/i, "");
}

export function EmailLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = React.useState(false);
  const email = emailFromHref(href);

  return (
    <a
      href={href}
      className={className}
      title={email}
      onClick={() => {
        if (!navigator.clipboard) return;
        void navigator.clipboard.writeText(email).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        });
      }}
    >
      {copied ? "Copied!" : children}
    </a>
  );
}
