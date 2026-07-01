"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/admin",
    label: "Writing",
    match: (path: string) =>
      path === "/admin" || path.startsWith("/admin/new") || /^\/admin\/[0-9a-f-]{36}$/u.test(path),
  },
  {
    href: "/admin/projects",
    label: "Projects",
    match: (path: string) => path.startsWith("/admin/projects"),
  },
  { href: "/admin/profile", label: "Profile", match: (path: string) => path === "/admin/profile" },
  { href: "/admin/skills", label: "Skills", match: (path: string) => path === "/admin/skills" },
  { href: "/admin/story", label: "Story", match: (path: string) => path === "/admin/story" },
  { href: "/admin/world", label: "World", match: (path: string) => path === "/admin/world" },
  {
    href: "/admin/settings",
    label: "Site & SEO",
    match: (path: string) => path === "/admin/settings",
  },
];
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-4">
        <nav className="flex flex-wrap items-center gap-1" aria-label="Admin sections">
          {links.map((link) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Button variant="outline" size="sm" onClick={onLogout}>
          Log out
        </Button>
      </header>
      {children}
    </div>
  );
}
