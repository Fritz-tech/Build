"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WorkspaceClient } from "./workspace-client";
import type { Project } from "@/db/schema";

interface Owner { name: string; email: string; image: string | null }

export default function WorkspacePage() {
  const params = useParams<{ projectId: string }>();
  const [data, setData] = useState<{ project: Project; owner: Owner } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(`/api/projects/${encodeURIComponent(params.projectId)}`, {
          cache: "no-store",
          credentials: "same-origin",
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load project");
        if (!cancelled) setData(body);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load project");
      }
    }
    load();
    return () => { cancelled = true; };
  }, [params.projectId]);

  if (error) return <main className="min-h-screen grid place-items-center p-6"><div className="text-center"><p className="text-sm text-red-600">{error}</p><a className="mt-4 inline-block text-violet-600 underline" href="/">Return home</a></div></main>;
  if (!data) return <main className="min-h-screen grid place-items-center text-sm text-gray-500">Loading your project…</main>;
  return <WorkspaceClient project={data.project} owner={data.owner} />;
}
