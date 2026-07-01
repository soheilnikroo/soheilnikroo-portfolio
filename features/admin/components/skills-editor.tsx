"use client";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { SkillCategorySchema, SkillGraphSchema } from "@/lib/schemas";
import type { SkillGraph, SkillNode } from "@/lib/schemas";

import { adminField, adminHint } from "./admin-fields";

export function SkillsEditor({ initial }: { initial: SkillGraph }) {
  const router = useRouter();
  const [graph, setGraph] = React.useState(initial);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  function updateNode(index: number, patch: Partial<SkillNode>) {
    setGraph((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n, i) => (i === index ? { ...n, ...patch } : n)),
    }));
  }
  function addNode() {
    setGraph((prev) => ({
      ...prev,
      nodes: [
        ...prev.nodes,
        {
          id: `skill-${prev.nodes.length + 1}`,
          label: "New skill",
          category: "practice" as const,
          level: 3,
          summary: "",
        },
      ],
    }));
  }
  function removeNode(index: number) {
    const id = graph.nodes[index]?.id;
    setGraph((prev) => ({
      nodes: prev.nodes.filter((_, i) => i !== index),
      edges: prev.edges.filter((e) => e.source !== id && e.target !== id),
    }));
  }
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const parsed = SkillGraphSchema.safeParse(graph);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid skill graph.");
      setSaving(false);
      return;
    }
    const res = await fetch("/api/admin/site/skills", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (res.ok) {
      router.refresh();
      setSaving(false);
      return;
    }
    setError("Failed to save skills.");
    setSaving(false);
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Skills</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Skill nodes for the gauntlet chapter. Edges stay in seed data for now.
        </p>
        <p className={adminHint}>Edge count: {graph.edges.length} (preserved on save)</p>
      </div>
      <ul className="grid gap-4">
        {graph.nodes.map((node, index) => (
          <li key={node.id} className="grid gap-3 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{node.label}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeNode(index)}>
                Remove
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={adminField}
                value={node.id}
                onChange={(e) => updateNode(index, { id: e.target.value })}
                aria-label={`Skill ${index + 1} id`}
              />
              <input
                className={adminField}
                value={node.label}
                onChange={(e) => updateNode(index, { label: e.target.value })}
                aria-label={`Skill ${index + 1} label`}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className={adminField}
                value={node.category}
                onChange={(e) =>
                  updateNode(index, { category: e.target.value as SkillNode["category"] })
                }
                aria-label={`Skill ${index + 1} category`}
              >
                {SkillCategorySchema.options.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={5}
                className={adminField}
                value={node.level}
                onChange={(e) => updateNode(index, { level: Number(e.target.value) })}
                aria-label={`Skill ${index + 1} level`}
              />
            </div>
            <textarea
              rows={2}
              className={adminField}
              value={node.summary ?? ""}
              onChange={(e) => updateNode(index, { summary: e.target.value })}
              aria-label={`Skill ${index + 1} summary`}
            />
          </li>
        ))}
      </ul>
      <Button type="button" variant="outline" onClick={addNode}>
        Add skill
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save skills"}
      </Button>
    </form>
  );
}
