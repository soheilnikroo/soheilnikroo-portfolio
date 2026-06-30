"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { SiteSettingsSchema } from "@/lib/schemas";
import type { NavLink, SiteSettings } from "@/lib/schemas";

import { adminField, adminHint, adminLabel } from "./admin-fields";

function Field({
  label,
  id,
  children,
  hint,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className={adminLabel} htmlFor={id}>
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {hint ? <p className={adminHint}>{hint}</p> : null}
    </div>
  );
}

export function SettingsEditor({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [form, setForm] = React.useState(initial);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setNav(index: number, patch: Partial<NavLink>) {
    setForm((prev) => ({
      ...prev,
      nav: prev.nav.map((link, i) => (i === index ? { ...link, ...patch } : link)),
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const parsed = SiteSettingsSchema.safeParse({
      ...form,
      keywords: form.keywords.filter(Boolean),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid settings.");
      setSaving(false);
      return;
    }
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (res.ok) {
      router.refresh();
      setSaving(false);
      return;
    }
    setError("Failed to save settings.");
    setSaving(false);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Site & SEO</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Global metadata, navigation, and page copy — used for SEO, Open Graph, and UI labels.
        </p>
      </div>

      <fieldset className="grid gap-4 rounded-xl border border-border/70 p-4">
        <legend className="px-1 text-sm font-medium">Global</legend>
        <Field label="Site name" id="name">
          <input
            id="name"
            className={adminField}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </Field>
        <Field label="Default title" id="title" hint="Browser tab & Open Graph default">
          <input
            id="title"
            className={adminField}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
          />
        </Field>
        <Field label="Meta description" id="description">
          <textarea
            id="description"
            rows={3}
            className={adminField}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            required
          />
        </Field>
        <Field label="Keywords" id="keywords" hint="Comma-separated — used in layout metadata">
          <input
            id="keywords"
            className={adminField}
            value={form.keywords.join(", ")}
            onChange={(e) =>
              set(
                "keywords",
                e.target.value
                  .split(",")
                  .map((k) => k.trim())
                  .filter(Boolean),
              )
            }
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Twitter handle" id="twitter">
            <input
              id="twitter"
              className={adminField}
              value={form.twitterHandle}
              onChange={(e) => set("twitterHandle", e.target.value)}
            />
          </Field>
          <Field label="Header brand" id="brand">
            <input
              id="brand"
              className={adminField}
              value={form.headerBrand}
              onChange={(e) => set("headerBrand", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Footer tagline" id="footerTagline">
          <input
            id="footerTagline"
            className={adminField}
            value={form.footerTagline}
            onChange={(e) => set("footerTagline", e.target.value)}
          />
        </Field>
        <Field label="Skip link label" id="skip">
          <input
            id="skip"
            className={adminField}
            value={form.skipToContent}
            onChange={(e) => set("skipToContent", e.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className="grid gap-3 rounded-xl border border-border/70 p-4">
        <legend className="px-1 text-sm font-medium">Navigation</legend>
        {form.nav.map((link, index) => (
          <div key={index} className="grid gap-3 sm:grid-cols-2">
            <input
              className={adminField}
              value={link.label}
              onChange={(e) => setNav(index, { label: e.target.value })}
              placeholder="Label"
              aria-label={`Nav label ${index + 1}`}
            />
            <input
              className={adminField}
              value={link.href}
              onChange={(e) => setNav(index, { href: e.target.value })}
              placeholder="/path"
              aria-label={`Nav href ${index + 1}`}
            />
          </div>
        ))}
      </fieldset>

      {(["work", "blog", "read"] as const).map((pageKey) => {
        const page = form.pages[pageKey];
        return (
          <fieldset key={pageKey} className="grid gap-4 rounded-xl border border-border/70 p-4">
            <legend className="px-1 text-sm font-medium capitalize">{pageKey} page</legend>
            <Field label="Title" id={`${pageKey}-title`}>
              <input
                id={`${pageKey}-title`}
                className={adminField}
                value={page.title}
                onChange={(e) =>
                  set("pages", {
                    ...form.pages,
                    [pageKey]: { ...page, title: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Description" id={`${pageKey}-desc`}>
              <textarea
                id={`${pageKey}-desc`}
                rows={2}
                className={adminField}
                value={page.description}
                onChange={(e) =>
                  set("pages", {
                    ...form.pages,
                    [pageKey]: { ...page, description: e.target.value },
                  })
                }
              />
            </Field>
            {"subtitle" in page ? (
              <Field label="Subtitle" id={`${pageKey}-sub`}>
                <textarea
                  id={`${pageKey}-sub`}
                  rows={2}
                  className={adminField}
                  value={page.subtitle ?? ""}
                  onChange={(e) =>
                    set("pages", {
                      ...form.pages,
                      [pageKey]: { ...page, subtitle: e.target.value },
                    })
                  }
                />
              </Field>
            ) : null}
          </fieldset>
        );
      })}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save site settings"}
      </Button>
    </form>
  );
}
