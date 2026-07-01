"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { toAdminProject } from "@/lib/data/projects-admin";

import { AdminDbUnavailable } from "./admin-db-unavailable";
import { AdminPanelSkeleton } from "./admin-panel-skeleton";
import type { AdminProject } from "./types";

export function ProjectsDashboard() {
  const router = useRouter();
  const [projects, setProjects] = React.useState<AdminProject[] | null>(null);
  const [dbError, setDbError] = React.useState(false);
  const [busy, setBusy] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/api/admin/projects", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as { projects: Parameters<typeof toAdminProject>[0][] };
        if (!cancelled) setProjects(json.projects.map(toAdminProject));
      } catch {
        if (!cancelled) setDbError(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function onDelete(project: AdminProject) {
    if (!window.confirm(`Delete “${project.data.title}”? This cannot be undone.`)) return;
    setBusy(project.id);
    const res = await fetch(`/api/admin/projects/${project.id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) {
      setProjects((prev) => (prev ? prev.filter((p) => p.id !== project.id) : prev));
      router.refresh();
    } else {
      window.alert("Failed to delete project.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {projects
              ? `${projects.length} project${projects.length === 1 ? "" : "s"} · work page updates live`
              : "Loading projects…"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/projects/new">New project</Link>
        </Button>
      </div>

      {projects === null && !dbError ? <AdminPanelSkeleton label="Loading projects…" /> : null}
      {dbError ? <AdminDbUnavailable /> : null}

      {projects ? (
        <ul className="mt-8 grid gap-3">
          {projects.map((project) => (
            <li
              key={project.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
                    {project.data.status}
                  </span>
                  <span>{project.data.year}</span>
                  {project.data.featured ? <span>· Featured</span> : null}
                </div>
                <p className="mt-1 truncate font-medium">{project.data.title}</p>
                <p className="truncate text-sm text-muted-foreground">/work/{project.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/work/${project.slug}`} target="_blank">
                    View
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/projects/${project.id}`}>Edit</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy === project.id}
                  onClick={() => onDelete(project)}
                  className="text-destructive hover:text-destructive"
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
          {projects.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border/70 p-10 text-center text-muted-foreground">
              No projects yet. Create your first one.
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
