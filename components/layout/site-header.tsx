"use client";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SoundToggle } from "@/features/ambient";
import type { NavLink } from "@/lib/schemas";
import { PIXEL_FONT, PIXEL_ICON_BTN } from "@/lib/world/world-theme";

import { Container } from "./container";

function navLinkClass(active: boolean): string {
  return `block rounded-[3px] border-2 px-3 py-2.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-pixel-border focus-visible:outline-none ${
    active
      ? "border-amber-500/60 bg-amber-100/80 text-amber-900 dark:border-amber-400/60 dark:bg-amber-900/30 dark:text-amber-100"
      : "border-transparent text-pixel-fg-muted hover:border-pixel-border/40 hover:text-pixel-fg"
  }`;
}

export function SiteHeader({ nav, brand }: { nav: readonly NavLink[]; brand: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuId = React.useId();
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  if (pathname === "/") {
    return (
      <header className={`fixed top-0 left-0 z-[var(--z-nav)] p-2 ${PIXEL_FONT}`}>
        <nav
          aria-label="Primary"
          className="sr-only flex max-w-max flex-wrap gap-1 rounded-[3px] border-2 border-white/25 bg-[#0d0b16]/95 p-1 focus-within:not-sr-only focus-within:opacity-100"
        >
          {nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[3px] border-2 border-transparent px-3 py-2 text-xs text-white/85 transition-colors hover:border-white/40 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
    );
  }

  return (
    <header
      className={`sticky top-0 z-[var(--z-nav)] border-b-2 border-pixel-border/30 bg-pixel-panel/95 text-pixel-fg ${PIXEL_FONT}`}
    >
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          className="text-sm font-bold tracking-wide text-pixel-fg focus-visible:ring-2 focus-visible:ring-pixel-border focus-visible:outline-none"
        >
          {brand}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
          {nav.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={navLinkClass(active)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            ref={menuButtonRef}
            type="button"
            className={`${PIXEL_ICON_BTN} sm:hidden`}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X className="size-4" aria-hidden="true" />
            ) : (
              <Menu className="size-4" aria-hidden="true" />
            )}
          </button>
          <SoundToggle className={PIXEL_ICON_BTN} />
          <ThemeToggle className={PIXEL_ICON_BTN} />
        </div>
      </Container>

      {menuOpen ? (
        <nav
          id={menuId}
          aria-label="Mobile"
          className="border-t-2 border-pixel-border/25 bg-pixel-panel px-gutter py-3 sm:hidden"
        >
          <ul className="space-y-1">
            {nav.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={navLinkClass(active)}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
