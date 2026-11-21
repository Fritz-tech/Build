"use client";

import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  MoreHorizontal,
  ExternalLink,
  Pencil,
  Trash2,
  Clock,
  Plus,
  Smartphone,
  Sparkles,
  Layers,
  Zap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────
export interface UserProject {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published" | "in-progress";
  updatedAt: string;
  gradient: string;
}

export interface MyProjectsProps {
  user?: {
    name: string;
    email: string;
    image?: string | null;
    credits?: number;
  };
  onNewProject?: () => void;
  onOpenProfile?: () => void;
}

// ─── Placeholder data ────────────────────────────────────────────────────
export const userProjects: UserProject[] = [
  {
    id: "u1",
    title: "My Fitness Tracker",
    description: "Track workouts, calories, and daily activity goals with beautiful charts.",
    status: "published",
    updatedAt: "2 hours ago",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    id: "u2",
    title: "Budget Planner",
    description: "Personal finance app with expense tracking, budgets, and savings goals.",
    status: "in-progress",
    updatedAt: "Yesterday",
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    id: "u3",
    title: "Recipe Collection",
    description: "Organize your favorite recipes with categories, photos, and shopping lists.",
    status: "draft",
    updatedAt: "3 days ago",
    gradient: "from-orange-400 to-rose-500",
  },
];

const statusStyles: Record<UserProject["status"], string> = {
  draft: "bg-gray-100 text-gray-600",
  published: "bg-green-50 text-green-700",
  "in-progress": "bg-amber-50 text-amber-700",
};

const statusLabels: Record<UserProject["status"], string> = {
  draft: "Draft",
  published: "Published",
  "in-progress": "In Progress",
};

// ─── My Projects Section ─────────────────────────────────────────────────
export function MyProjects({ user, onNewProject, onOpenProfile }: MyProjectsProps) {
  const firstName = user?.name ? user.name.split(" ")[0] : "Creator";

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6">
      {/* Personalized Welcome & Stats Bar */}
      {user && (
        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold text-lg shadow-md shadow-violet-200">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                  Welcome back, {firstName}! 👋
                </h3>
                <p className="text-xs text-gray-500">
                  {user.email} · Ready to build your next mobile app
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-violet-50/70 border border-violet-100 px-3.5 py-2">
                <Sparkles className="h-4 w-4 text-violet-600" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-violet-500">
                    Free Credits
                  </p>
                  <p className="text-xs font-bold text-violet-900">
                    {user.credits ?? 100} available
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-100 px-3.5 py-2">
                <Layers className="h-4 w-4 text-gray-500" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Active Apps
                  </p>
                  <p className="text-xs font-bold text-gray-800">
                    {userProjects.length} projects
                  </p>
                </div>
              </div>

              {onOpenProfile && (
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-500 mb-1">
            Your Workspace
          </p>
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {firstName}&apos;s Projects
          </h2>
        </div>
        <Button
          onClick={onNewProject}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 text-xs sm:text-sm font-semibold gap-1.5 rounded-xl px-4 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {userProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}

        {/* Create new card */}
        <button
          type="button"
          onClick={onNewProject}
          className="group flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 transition-all hover:border-violet-300 hover:bg-violet-50/50 cursor-pointer active:scale-[0.98]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-gray-200 shadow-xs transition-colors group-hover:border-violet-200 group-hover:bg-violet-100">
            <Plus className="h-5 w-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
          </div>
          <span className="text-xs font-medium text-gray-500 group-hover:text-violet-600 transition-colors">
            Create New App
          </span>
        </button>
      </div>
    </section>
  );
}

// ─── Individual Project Card ─────────────────────────────────────────────
function ProjectCard({ project }: { project: UserProject }) {
  return (
    <Card className="group overflow-hidden border-gray-100 bg-white transition-all duration-200 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80 cursor-pointer">
      {/* Gradient header */}
      <div
        className={`relative h-28 w-full bg-gradient-to-br ${project.gradient} flex items-center justify-center overflow-hidden`}
      >
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 h-14 w-14 rounded-full bg-white/10" />
        <Smartphone className="h-9 w-9 text-white/50" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
              statusStyles[project.status]
            }`}
          >
            {statusLabels[project.status]}
          </span>
        </div>

        {/* More menu */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                <MoreHorizontal className="h-4 w-4 text-white" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="gap-2 cursor-pointer text-xs">
                <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer text-xs">
                <Pencil className="h-3.5 w-3.5 text-gray-400" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer text-xs text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-violet-700 transition-colors">
          {project.title}
        </h3>
        <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
          <Clock className="h-3 w-3" />
          Updated {project.updatedAt}
        </div>
      </CardContent>
    </Card>
  );
}
