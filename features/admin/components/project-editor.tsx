"use client";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { ProjectSchema, ProjectStatusSchema } from "@/lib/schemas";
import type { Project, ProjectNarrative } from "@/lib/schemas";

import type { AdminProject } from "./types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
const field =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
const labelCls = "block text-sm font-medium";
const emptyNarrative: ProjectNarrative = {
  problem: "",
  challenge: "",
  process: "",
  solution: "",
  outcome: "",
};
export function ProjectEditor({
  mode,
  project,
}: {
  mode: "create" | "edit";
  project?: AdminProject;
}) {
  const router = useRouter();
  const initial = project?.data;
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? project?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(initial?.slug));
  const [summary, setSummary] = React.useState(initial?.summary ?? "");
  const [year, setYear] = React.useState(String(initial?.year ?? new Date().getFullYear()));
  const [role, setRole] = React.useState(initial?.role ?? "");
  const [status, setStatus] = React.useState<Project["status"]>(initial?.status ?? "live");
  const [tags, setTags] = React.useState((initial?.tags ?? []).join(", "));
  const [tech, setTech] = React.useState((initial?.tech ?? []).join(", "));
  const [liveUrl, setLiveUrl] = React.useState(initial?.links.live ?? "");
  const [repoUrl, setRepoUrl] = React.useState(initial?.links.repo ?? "");
  const [accent, setAccent] = React.useState(initial?.accent ?? "#6366f1");
  const [featured, setFeatured] = React.useState(initial?.featured ?? false);
  const [order, setOrder] = React.useState(String(initial?.order ?? 0));
  const [narrative, setNarrative] = React.useState<ProjectNarrative>(
    initial?.narrative ?? emptyNarrative,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const effectiveSlug = slugTouched ? slug : slugify(title);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = ProjectSchema.safeParse({
      slug: effectiveSlug,
      title,
      summary,
      year: Number(year),
      role,
      status,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      tech: tech
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      links: {
        ...(liveUrl ? { live: liveUrl } : {}),
        ...(repoUrl ? { repo: repoUrl } : {}),
      },
      accent: accent || undefined,
      featured,
      order: Number(order),
      narrative,
    });
    if (!payload.success) {
      setError(payload.error.issues[0]?.message ?? "Invalid project data.");
      setSaving(false);
      return;
    }
    const url = mode === "create" ? "/api/admin/projects" : `/api/admin/projects/${project?.id}`;
    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload.data),
    });
    if (res.ok) {
      router.push("/admin/projects");
      router.refresh();
      return;
    }
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
    };
    setError(data.error ?? "Failed to save.");
    setSaving(false);
  }
  function setNarrativeField(key: keyof ProjectNarrative, value: string) {
    setNarrative((prev) => ({ ...prev, [key]: value }));
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {mode === "create" ? "New project" : "Edit project"}
        </h1>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="size-4 accent-[var(--primary)]"
          />
          Featured
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className={`mt-1 ${field}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="slug">
            Slug
          </label>
          <input
            id="slug"
            className={`mt-1 ${field}`}
            value={effectiveSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="summary">
          Summary
        </label>
        <textarea
          id="summary"
          rows={2}
          className={`mt-1 ${field}`}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-4">
        <div>
          <label className={labelCls} htmlFor="year">
            Year
          </label>
          <input
            id="year"
            type="number"
            className={`mt-1 ${field}`}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="role">
            Role
          </label>
          <input
            id="role"
            className={`mt-1 ${field}`}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="status">
            Status
          </label>
          <select
            id="status"
            className={`mt-1 ${field}`}
            value={status}
            onChange={(e) => setStatus(e.target.value as Project["status"])}
          >
            {ProjectStatusSchema.options.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="order">
            Display order
          </label>
          <input
            id="order"
            type="number"
            className={`mt-1 ${field}`}
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="tags">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            className={`mt-1 ${field}`}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="tech">
            Tech (comma-separated)
          </label>
          <input
            id="tech"
            className={`mt-1 ${field}`}
            value={tech}
            onChange={(e) => setTech(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={labelCls} htmlFor="live">
            Live URL
          </label>
          <input
            id="live"
            className={`mt-1 ${field}`}
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="repo">
            Repo URL
          </label>
          <input
            id="repo"
            className={`mt-1 ${field}`}
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="accent">
            Accent color
          </label>
          <input
            id="accent"
            className={`mt-1 ${field}`}
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
          />
        </div>
      </div>

      <fieldset className="grid gap-4 rounded-xl border border-border/70 p-4">
        <legend className="px-1 text-sm font-medium">Narrative</legend>
        {(["problem", "challenge", "process", "solution", "outcome"] as const).map((key) => (
          <div key={key}>
            <label className={labelCls} htmlFor={`narrative-${key}`}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
            <textarea
              id={`narrative-${key}`}
              rows={2}
              className={`mt-1 ${field}`}
              value={narrative[key]}
              onChange={(e) => setNarrativeField(key, e.target.value)}
              required
            />
          </div>
        ))}
      </fieldset>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : mode === "create" ? "Create project" : "Save changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/projects")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
