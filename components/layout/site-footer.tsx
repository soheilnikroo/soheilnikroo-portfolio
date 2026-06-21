import Link from "next/link";

import { getProfile } from "@/lib/data";

import { Container } from "./container";

export async function SiteFooter() {
  const profile = await getProfile();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-section border-t border-border/60 py-10">
      <Container className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-heading text-sm font-semibold">{profile.name}</p>
          <p className="text-sm text-muted-foreground">{profile.role}</p>
        </div>

        <nav aria-label="Social" className="flex flex-wrap gap-4">
          {profile.socials.map((social) => (
            <Link
              key={social.platform}
              href={social.href}
              className="rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {social.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-muted-foreground">
          © {year} {profile.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
