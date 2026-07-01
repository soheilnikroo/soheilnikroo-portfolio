import Link from "next/link";

import { getProfile } from "@/lib/data";
import { PIXEL_FONT } from "@/lib/world/world-theme";

import { Container } from "./container";

export async function SiteFooter({ tagline }: { tagline: string }) {
  const profile = await getProfile();
  const year = new Date().getFullYear();
  return (
    <footer
      className={`mt-section border-t-2 border-pixel-border/30 bg-pixel-panel py-10 text-pixel-fg ${PIXEL_FONT}`}
    >
      <Container className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold">★ {profile.name}</p>
          <p className="text-sm text-pixel-fg-muted">{profile.role}</p>
        </div>

        <nav aria-label="Social" className="flex flex-wrap gap-3">
          {profile.socials.map((social) => (
            <Link
              key={social.platform}
              href={social.href}
              className="rounded-[3px] border-2 border-pixel-border/35 px-2.5 py-1 text-sm text-pixel-fg-muted transition-colors hover:border-pixel-border/60 hover:text-pixel-fg"
            >
              {social.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-pixel-fg-muted/70">
          © {year} {profile.name} · {tagline}
        </p>
      </Container>
    </footer>
  );
}
