"use client";

import * as React from "react";

import { ProjectEditor } from "@/features/admin/components/project-editor";
import { toAdminProject } from "@/lib/data/projects-admin";

import { AdminDbUnavailable } from "./admin-db-unavailable";
import { AdminPanelSkeleton } from "./admin-panel-skeleton";

export function ProjectEditorLoader({ id }: { id: string }) {
  const [state, setState] = React.useState<"loading" | "ready" | "error">("loading");
  const [project, setProject] = React.useState<ReturnType<typeof toAdminProject> | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(`/api/admin/projects/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as { project: Parameters<typeof toAdminProject>[0] };
        if (cancelled) return;
        setProject(toAdminProject(json.project));
        setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state === "loading") {
    return <AdminPanelSkeleton label="Loading project…" />;
  }

  if (state === "error" || !project) {
    return <AdminDbUnavailable />;
  }

  return <ProjectEditor mode="edit" project={project} />;
}
