"use client";

import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, ExternalLink, Clock } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────
export interface AppProject {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  author: {
    name: string;
    avatar?: string;
  };
  likes: number;
  views: number;
  createdAt: string;
}

// ─── Placeholder data for community apps ─────────────────────────────────
export const communityApps: AppProject[] = [
  {
    id: "1",
    title: "FreshCart – Grocery Delivery",
    description: "A modern grocery delivery app with smart recommendations and real-time order tracking.",
    thumbnail: "",
    category: "E-commerce",
    author: { name: "Sarah Chen" },
    likes: 342,
    views: 2_840,
    createdAt: "2 days ago",
  },
  {
    id: "2",
    title: "MindFlow – Meditation",
    description: "Calming meditation app with guided sessions, sleep sounds, and daily mindfulness reminders.",
    thumbnail: "",
    category: "Health",
    author: { name: "Alex Rivera" },
    likes: 218,
    views: 1_620,
    createdAt: "5 days ago",
  },
  {
    id: "3",
    title: "StudyBuddy – Flashcards",
    description: "AI-powered flashcard app with spaced repetition, progress analytics, and group study.",
    thumbnail: "",
    category: "Education",
    author: { name: "Maya Patel" },
    likes: 175,
    views: 1_390,
    createdAt: "1 week ago",
  },
  {
    id: "4",
    title: "PetPal – Pet Care",
    description: "All-in-one pet care companion with vet appointments, feeding schedules, and pet community.",
    thumbnail: "",
    category: "Lifestyle",
    author: { name: "James Wilson" },
    likes: 289,
    views: 2_150,
    createdAt: "3 days ago",
  },
  {
    id: "5",
    title: "RouteRunner – Fitness",
    description: "GPS fitness tracker for runners with route mapping, pace analysis, and social challenges.",
    thumbnail: "",
    category: "Fitness",
    author: { name: "Lena Kim" },
    likes: 410,
    views: 3_200,
    createdAt: "1 day ago",
  },
  {
    id: "6",
    title: "SnapRecipe – Cooking",
    description: "Scan ingredients with your camera and get instant recipe suggestions with step-by-step guides.",
    thumbnail: "",
    category: "Food",
    author: { name: "David Okonkwo" },
    likes: 198,
    views: 1_750,
    createdAt: "4 days ago",
  },
];

// ─── Placeholder gradient thumbnails (no real images needed) ─────────────
const gradients = [
  "from-violet-400 to-purple-500",
  "from-sky-400 to-blue-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-pink-500",
  "from-indigo-400 to-blue-600",
];

const categoryColors: Record<string, string> = {
  "E-commerce": "bg-amber-50 text-amber-700",
  Health: "bg-green-50 text-green-700",
  Education: "bg-blue-50 text-blue-700",
  Lifestyle: "bg-purple-50 text-purple-700",
  Fitness: "bg-orange-50 text-orange-700",
  Food: "bg-rose-50 text-rose-700",
};

// ─── Community showcase component ────────────────────────────────────────
export function CommunityShowcase() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-500 mb-1.5">
          Community
        </p>
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Built with Fritz
        </h2>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          See what others are creating. Get inspired and start building your own app.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {communityApps.map((app, i) => (
          <AppCard key={app.id} app={app} gradientIndex={i} />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 active:scale-95">
          <ExternalLink className="h-4 w-4" />
          Explore All Apps
        </button>
      </div>
    </section>
  );
}

// ─── Individual App Card ─────────────────────────────────────────────────
function AppCard({
  app,
  gradientIndex,
}: {
  app: AppProject;
  gradientIndex: number;
}) {
  const gradient = gradients[gradientIndex % gradients.length];
  const catColor = categoryColors[app.category] || "bg-gray-50 text-gray-700";

  return (
    <Card className="group overflow-hidden border-gray-100 bg-white transition-all duration-200 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80 cursor-pointer">
      {/* Thumbnail placeholder */}
      <div
        className={`relative h-40 w-full bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
      >
        {/* Decorative shapes */}
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10" />
        <div className="absolute bottom-3 right-3 h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm" />
        {/* App icon placeholder */}
        <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg flex items-center justify-center">
          <span className="text-2xl font-bold text-white/90">
            {app.title.charAt(0)}
          </span>
        </div>
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${catColor}`}
          >
            {app.category}
          </span>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-violet-700 transition-colors">
          {app.title}
        </h3>
        <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {app.description}
        </p>

        {/* Footer */}
        <div className="mt-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              {app.author.avatar && (
                <AvatarImage src={app.author.avatar} alt={app.author.name} />
              )}
              <AvatarFallback className="bg-gray-100 text-gray-500 text-[10px] font-medium">
                {app.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500">{app.author.name}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <span className="flex items-center gap-1 text-[11px]">
              <Heart className="h-3 w-3" />
              {app.likes}
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <Eye className="h-3 w-3" />
              {app.views.toLocaleString("en-US")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
