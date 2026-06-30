"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { MilestonesSchema } from "@/lib/schemas";
import type { Milestone } from "@/lib/schemas";

import { adminField } from "./admin-fields";

export function MilestonesEditor({ initial }: { initial: Milestone[] }) {
  const router = useRouter();
  const [items, setItems] = React.useState(initial);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  function update(index: number, patch: Partial<Milestone>) {
    setItems((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: `milestone-${prev.length + 1}`, period: "", title: "", description: "" },
    ]);
  }

  function remove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const parsed = MilestonesSchema.safeParse(items);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid milestones.");
      setSaving(false);
      return;
    }
    const res = await fetch("/api/admin/site/milestones", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (res.ok) {
      router.refresh();
      setSaving(false);
      return;
    }
    setError("Failed to save milestones.");
    setSaving(false);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Story milestones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Intro chapter timeline shown in the world experience.
        </p>
      </div>
      <ul className="grid gap-4">
        {items.map((item, index) => (
          <li key={item.id} className="grid gap-3 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Milestone {index + 1}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                Remove
              </Button>
            </div>
            <input
              className={adminField}
              value={item.period}
              onChange={(e) => update(index, { period: e.target.value })}
              placeholder="Period label"
              aria-label={`Milestone ${index + 1} period`}
            />
            <input
              className={adminField}
              value={item.title}
              onChange={(e) => update(index, { title: e.target.value })}
              placeholder="Title"
              aria-label={`Milestone ${index + 1} title`}
            />
            <textarea
              rows={3}
              className={adminField}
              value={item.description}
              onChange={(e) => update(index, { description: e.target.value })}
              placeholder="Description"
              aria-label={`Milestone ${index + 1} description`}
            />
          </li>
        ))}
      </ul>
      <Button type="button" variant="outline" onClick={addItem}>
        Add milestone
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save milestones"}
      </Button>
    </form>
  );
}
