"use client";

import type { SocialLink } from "@/lib/schemas";

import { EmailLink } from "./email-link";

const linkClass =
  "rounded-[3px] border-2 border-pixel-border/35 px-2.5 py-1 text-sm text-pixel-fg-muted transition-colors hover:border-pixel-border/60 hover:text-pixel-fg";

export function SocialNav({ socials }: { socials: readonly SocialLink[] }) {
  return (
    <nav aria-label="Social" className="flex flex-wrap gap-3">
      {socials.map((social) =>
        social.platform === "email" ? (
          <EmailLink key={social.platform} href={social.href} className={linkClass}>
            {social.label}
          </EmailLink>
        ) : (
          <a
            key={social.platform}
            href={social.href}
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            {social.label}
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        ),
      )}
    </nav>
  );
}
