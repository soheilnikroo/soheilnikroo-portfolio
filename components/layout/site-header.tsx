"use client";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SoundToggle } from "@/features/ambient";
import type { NavLink } from "@/lib/schemas";

import { Container } from "./container";

const PIXEL_ICON_BTN =
  "inline-flex size-10 items-center justify-center rounded-[3px] border-2 border-white/60 bg-[#0d0b16] text-white/85 shadow-[2px_2px_0_rgba(0,0,0,0.5)] transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:opacity-40";

function navLinkClass(active: boolean): string {
  return `block rounded-[3px] border-2 px-3 py-2.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none ${
    active
      ? "border-amber-400/60 bg-amber-900/30 text-amber-100"
      : "border-transparent text-white/70 hover:border-white/30 hover:text-white"
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

  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-[var(--z-nav)] border-b-2 border-white/15 bg-[#0d0b16]/95 [font-family:var(--font-pixel),ui-monospace,monospace] text-white">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          className="text-sm font-bold tracking-wide text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
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
          {pathname !== "/read" ? <ThemeToggle className={PIXEL_ICON_BTN} /> : null}
        </div>
      </Container>

      {menuOpen ? (
        <nav
          id={menuId}
          aria-label="Mobile"
          className="border-t-2 border-white/10 bg-[#0d0b16] px-gutter py-3 sm:hidden"
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
