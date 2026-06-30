import Link from "next/link";

import { getProfile } from "@/lib/data";

import { Container } from "./container";

export async function SiteFooter() {
  const profile = await getProfile();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-section border-t-2 border-white/15 bg-[#0d0b16] py-10 [font-family:var(--font-pixel),ui-monospace,monospace] text-white">
      <Container className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold">★ {profile.name}</p>
          <p className="text-sm text-white/55">{profile.role}</p>
        </div>

        <nav aria-label="Social" className="flex flex-wrap gap-3">
          {profile.socials.map((social) => (
            <Link
              key={social.platform}
              href={social.href}
              className="rounded-[3px] border-2 border-white/20 px-2.5 py-1 text-sm text-white/70 transition-colors hover:border-white/40 hover:text-white"
            >
              {social.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-white/40">
          © {year} {profile.name} · insert coin
        </p>
      </Container>
    </footer>
  );
}
