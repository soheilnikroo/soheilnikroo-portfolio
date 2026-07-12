"use client";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { adminFetch, adminFetchTimeoutMessage } from "@/features/admin/lib/admin-fetch";
import { WorldNarrativeSchema } from "@/lib/schemas";
import type { StoryBeat, WorldNarrative } from "@/lib/schemas";

import { adminField, adminHint, adminLabel } from "./admin-fields";

const CHAPTER_IDS = ["intro", "work", "skills", "writing", "contact"] as const;
export function WorldEditor({ initial }: { initial: WorldNarrative }) {
  const router = useRouter();
  const [form, setForm] = React.useState(initial);
  const [activeChapter, setActiveChapter] = React.useState<(typeof CHAPTER_IDS)[number]>("intro");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  function updateChapter(index: number, patch: Partial<WorldNarrative["chapters"][number]>) {
    setForm((prev) => ({
      ...prev,
      chapters: prev.chapters.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    }));
  }
  function updateBeat(index: number, patch: Partial<StoryBeat>) {
    setForm((prev) => {
      const beats = [...(prev.storyBeats[activeChapter] ?? [])];
      beats[index] = { ...beats[index]!, ...patch };
      return { ...prev, storyBeats: { ...prev.storyBeats, [activeChapter]: beats } };
    });
  }
  function addBeat() {
    setForm((prev) => ({
      ...prev,
      storyBeats: {
        ...prev.storyBeats,
        [activeChapter]: [...(prev.storyBeats[activeChapter] ?? []), { at: 0.5, text: "" }],
      },
    }));
  }
  function removeBeat(index: number) {
    setForm((prev) => ({
      ...prev,
      storyBeats: {
        ...prev.storyBeats,
        [activeChapter]: (prev.storyBeats[activeChapter] ?? []).filter((_, i) => i !== index),
      },
    }));
  }
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const parsed = WorldNarrativeSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid world content.");
      setSaving(false);
      return;
    }
    try {
      const res = await adminFetch("/api/admin/world", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      setError("Failed to save world content.");
    } catch {
      setError(adminFetchTimeoutMessage());
    } finally {
      setSaving(false);
    }
  }
  const beats = form.storyBeats[activeChapter] ?? [];
  return (
    <form onSubmit={onSubmit} className="grid gap-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">World narrative</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Scroll-game dialogue, chapter titles, and HUD hints — updates live on the homepage.
        </p>
      </div>

      <div>
        <label className={adminLabel} htmlFor="introProse">
          Intro prose (/read header)
        </label>
        <textarea
          id="introProse"
          rows={4}
          className={`mt-1 ${adminField}`}
          value={form.introProse}
          onChange={(e) => setForm((prev) => ({ ...prev, introProse: e.target.value }))}
        />
      </div>

      <fieldset className="grid gap-4 rounded-xl border border-border/70 p-4">
        <legend className="px-1 text-sm font-medium">Chapters</legend>
        {form.chapters.map((chapter, index) => (
          <div key={chapter.id} className="grid gap-3 rounded-lg border border-border/50 p-3">
            <p className="text-xs font-medium text-muted-foreground uppercase">{chapter.id}</p>
            <input
              className={adminField}
              value={chapter.title}
              onChange={(e) => updateChapter(index, { title: e.target.value })}
              placeholder="Chapter title"
              aria-label={`${chapter.id} title`}
            />
            <input
              type="number"
              step="0.1"
              className={adminField}
              value={chapter.weight}
              onChange={(e) => updateChapter(index, { weight: Number(e.target.value) })}
              aria-label={`${chapter.id} scroll weight`}
            />
            <input
              className={adminField}
              value={form.chapterGoals[chapter.id] ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  chapterGoals: { ...prev.chapterGoals, [chapter.id]: e.target.value },
                }))
              }
              placeholder="HUD goal hint"
              aria-label={`${chapter.id} goal`}
            />
          </div>
        ))}
      </fieldset>

      <div>
        <div className="flex flex-wrap gap-2">
          {CHAPTER_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveChapter(id)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                activeChapter === id
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {id}
            </button>
          ))}
        </div>
        <p className={`${adminHint} mt-2`}>
          Story beats for <strong>{activeChapter}</strong> — `at` is scroll progress 0–1.
        </p>
        <ul className="mt-4 grid gap-3">
          {beats.map((beat, index) => (
            <li
              key={index}
              className="grid gap-2 rounded-lg border border-border/50 p-3 sm:grid-cols-[100px_1fr_auto]"
            >
              <input
                type="number"
                step="0.01"
                min={0}
                max={1}
                className={adminField}
                value={beat.at}
                onChange={(e) => updateBeat(index, { at: Number(e.target.value) })}
                aria-label={`Beat ${index + 1} threshold`}
              />
              <input
                className={adminField}
                value={beat.text}
                onChange={(e) => updateBeat(index, { text: e.target.value })}
                aria-label={`Beat ${index + 1} text`}
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeBeat(index)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={addBeat}>
          Add beat
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save world narrative"}
      </Button>
    </form>
  );
}
