"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Clock,
  Layers,
  FileImage,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project } from "@/db/schema";

interface Owner {
  name: string;
  email: string;
  image: string | null;
}

interface ParsedAsset {
  key: string;
  url: string;
  name: string;
  type: string;
  size: number;
}

interface WorkspaceClientProps {
  project: Project;
  owner: Owner;
}

const statusConfig = {
  queued: {
    label: "Queued",
    icon: ListChecks,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
    description: "Your project is in the queue and will start building soon.",
  },
  building: {
    label: "Building",
    icon: Loader2,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    dot: "bg-violet-500 animate-pulse",
    description: "AI is actively building your app. This may take a few minutes.",
  },
  done: {
    label: "Done",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    dot: "bg-green-500",
    description: "Your app has been successfully built!",
  },
  error: {
    label: "Error",
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
    description: "Something went wrong. Please try again.",
  },
} as const;

type ProjectStatus = keyof typeof statusConfig;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format a date string for display.
 * Must only be called client-side (inside useEffect or after mount).
 */
function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WorkspaceClient({ project, owner }: WorkspaceClientProps) {
  const status = (project.status as ProjectStatus) ?? "queued";
  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  // Defer locale-dependent date formatting to the client only
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  const assets: ParsedAsset[] = React.useMemo(() => {
    try {
      return JSON.parse(project.assets ?? "[]");
    } catch {
      return [];
    }
  }, [project.assets]);

  const [copyDone, setCopyDone] = useState(false);
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(project.prompt).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 1800);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 via-white to-gray-50/50">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-200 transition-transform group-hover:scale-105">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              Fritz builds
            </span>
          </Link>

          <Link href="/">
            <Button variant="ghost" size="default" className="gap-2 text-sm text-gray-600">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Status Banner */}
        <div
          className={`mb-8 flex items-start gap-4 rounded-2xl border ${cfg.border} ${cfg.bg} px-5 py-4`}
        >
          <div className="mt-0.5 flex-shrink-0">
            <StatusIcon
              className={`h-5 w-5 ${cfg.color} ${status === "building" ? "animate-spin" : ""}`}
            />
          </div>
          <div>
            <p className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</p>
            <p className="mt-0.5 text-xs text-gray-500">{cfg.description}</p>
          </div>
          {/* Pulsing dot indicator */}
          <div className="ml-auto flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
          </div>
        </div>

        {/* Project Details Card */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {/* Gradient header */}
          <div className="relative h-20 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 overflow-hidden">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-white/10" />
            <div className="absolute inset-0 flex items-center px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Project
                  </p>
                  <p className="text-sm font-bold text-white truncate max-w-[300px]">
                    {project.prompt.length > 60
                      ? project.prompt.slice(0, 60) + "…"
                      : project.prompt}
                  </p>
                </div>
              </div>
              {/* Status badge */}
              <div className="ml-auto">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border ${cfg.border} bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="divide-y divide-gray-50 px-6">
            {/* Prompt */}
            <section className="py-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Prompt
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {project.prompt}
              </p>
              <button
                onClick={handleCopyPrompt}
                className="mt-3 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors"
              >
                {copyDone ? "Copied!" : "Copy prompt"}
              </button>
            </section>

            {/* Meta */}
            <section className="py-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Project ID
                  </p>
                  <p className="mt-1 text-xs font-mono text-gray-600 truncate">
                    {project.id}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Created By
                  </p>
                  <p className="mt-1 text-xs text-gray-700 font-medium">
                    {owner.name}
                  </p>
                  <p className="text-[10px] text-gray-400">{owner.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Created
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    {mounted ? formatDate(project.createdAt) : "—"}
                  </p>
                </div>
              </div>
            </section>

            {/* Assets */}
            {assets.length > 0 && (
              <section className="py-6">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <FileImage className="h-3.5 w-3.5" />
                  Reference Assets ({assets.length})
                </h3>
                <div className="flex flex-wrap gap-3">
                  {assets.map((asset) => (
                    <div
                      key={asset.key}
                      className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
                    >
                      {asset.type.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white">
                          <FileImage className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate max-w-[140px]">
                          {asset.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {formatBytes(asset.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Coming-soon AI section */}
        <div className="mt-8 rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 px-6 py-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-200">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">
            AI Build Pipeline
          </h3>
          <p className="mt-1 text-xs text-gray-500 max-w-xs mx-auto">
            The full app-building workflow will be integrated here. Your project
            is saved and ready to go!
          </p>
        </div>
      </main>
    </div>
  );
}
