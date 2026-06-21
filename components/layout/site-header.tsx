import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SoundToggle } from "@/features/ambient";

import { Container } from "./container";

const NAV_LINKS = [
  { href: "/#work", label: "Work" },
  { href: "/#about", label: "About" },
  { href: "/blog", label: "Writing" },
  { href: "/#contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-[var(--z-nav)] border-b border-border/60 bg-background/70 backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          className="rounded-md font-heading text-sm font-semibold tracking-tight focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          Soheil&nbsp;Nikroo
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <SoundToggle />
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
