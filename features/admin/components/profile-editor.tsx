"use client";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { ProfileSchema } from "@/lib/schemas";
import type { Profile } from "@/lib/schemas";

const field =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
const labelCls = "block text-sm font-medium";
export function ProfileEditor({ initial }: { initial: Profile }) {
  const router = useRouter();
  const [name, setName] = React.useState(initial.name);
  const [role, setRole] = React.useState(initial.role);
  const [tagline, setTagline] = React.useState(initial.tagline);
  const [summary, setSummary] = React.useState(initial.summary);
  const [location, setLocation] = React.useState(initial.location);
  const [email, setEmail] = React.useState(initial.email);
  const [availability, setAvailability] = React.useState(initial.availability ?? "");
  const [resumeUrl, setResumeUrl] = React.useState(initial.resumeUrl ?? "");
  const [socialsJson, setSocialsJson] = React.useState(JSON.stringify(initial.socials, null, 2));
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    let socials: Profile["socials"];
    try {
      socials = JSON.parse(socialsJson) as Profile["socials"];
    } catch {
      setError("Social links must be valid JSON.");
      setSaving(false);
      return;
    }
    const parsed = ProfileSchema.safeParse({
      name,
      role,
      tagline,
      summary,
      location,
      email,
      availability: availability || undefined,
      resumeUrl: resumeUrl || undefined,
      socials,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid profile data.");
      setSaving(false);
      return;
    }
    const res = await fetch("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (res.ok) {
      router.refresh();
      setSaving(false);
      return;
    }
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
    };
    setError(data.error ?? "Failed to save profile.");
    setSaving(false);
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Homepage, footer, and world intro copy — updates go live immediately.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className={`mt-1 ${field}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
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
      </div>

      <div>
        <label className={labelCls} htmlFor="tagline">
          Tagline
        </label>
        <input
          id="tagline"
          className={`mt-1 ${field}`}
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="summary">
          Summary
        </label>
        <textarea
          id="summary"
          rows={4}
          className={`mt-1 ${field}`}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="location">
            Location
          </label>
          <input
            id="location"
            className={`mt-1 ${field}`}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`mt-1 ${field}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="availability">
            Availability
          </label>
          <input
            id="availability"
            className={`mt-1 ${field}`}
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="resumeUrl">
            Resume URL
          </label>
          <input
            id="resumeUrl"
            className={`mt-1 ${field}`}
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="socials">
          Social links (JSON array)
        </label>
        <textarea
          id="socials"
          rows={10}
          className={`mt-1 font-mono text-sm ${field}`}
          value={socialsJson}
          onChange={(e) => setSocialsJson(e.target.value)}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
