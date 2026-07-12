"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { adminFetch } from "@/features/admin/lib/admin-fetch";

import { AdminDbUnavailable } from "./admin-db-unavailable";
import type { AdminProject } from "./types";

type ProjectsDashboardProps = {
  initialProjects: AdminProject[];
  dbUnavailable?: boolean;
};

export function ProjectsDashboard({
  initialProjects,
  dbUnavailable = false,
}: ProjectsDashboardProps) {
  const router = useRouter();
  const [projects, setProjects] = React.useState(initialProjects);
  const [busy, setBusy] = React.useState<string | null>(null);

  async function onDelete(project: AdminProject) {
    if (!window.confirm(`Delete “${project.data.title}”? This cannot be undone.`)) return;
    setBusy(project.id);
    try {
      const res = await adminFetch(`/api/admin/projects/${project.id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== project.id));
        router.refresh();
      } else {
        window.alert("Failed to delete project.");
      }
    } catch {
      window.alert("Delete timed out or the server could not be reached. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {dbUnavailable
              ? "Projects could not be loaded"
              : `${projects.length} project${projects.length === 1 ? "" : "s"} · work page updates live`}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/projects/new">New project</Link>
        </Button>
      </div>

      {dbUnavailable ? <AdminDbUnavailable /> : null}

      {!dbUnavailable ? (
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
