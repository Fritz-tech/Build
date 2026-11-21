"use client";

import React from "react";
import {
  ShoppingCart,
  MessageSquare,
  CalendarDays,
  BarChart3,
  Utensils,
  Heart,
  Dumbbell,
  BookOpen,
  Palette,
} from "lucide-react";

interface SuggestionChip {
  label: string;
  prompt: string;
  icon: React.ReactNode;
  color: string; // tailwind bg/text classes
}

const suggestions: SuggestionChip[] = [
  {
    label: "E-commerce App",
    prompt: "Build a modern e-commerce mobile app with product listings, cart, and checkout flow",
    icon: <ShoppingCart className="h-3.5 w-3.5" />,
    color: "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100",
  },
  {
    label: "Chat App",
    prompt: "Create a real-time messaging app with chat rooms, media sharing, and user presence",
    icon: <MessageSquare className="h-3.5 w-3.5" />,
    color: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100",
  },
  {
    label: "Task Manager",
    prompt: "Build a task management app with boards, lists, due dates, and team collaboration",
    icon: <CalendarDays className="h-3.5 w-3.5" />,
    color: "bg-green-50 text-green-600 border-green-100 hover:bg-green-100",
  },
  {
    label: "Analytics Dashboard",
    prompt: "Create a data analytics dashboard with interactive charts, filters, and real-time updates",
    icon: <BarChart3 className="h-3.5 w-3.5" />,
    color: "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100",
  },
  {
    label: "Food Delivery",
    prompt: "Build a food delivery app with restaurant listings, menu browsing, and order tracking",
    icon: <Utensils className="h-3.5 w-3.5" />,
    color: "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100",
  },
  {
    label: "Health Tracker",
    prompt: "Create a health and wellness tracker with activity logging, goals, and progress charts",
    icon: <Heart className="h-3.5 w-3.5" />,
    color: "bg-red-50 text-red-600 border-red-100 hover:bg-red-100",
  },
  {
    label: "Fitness App",
    prompt: "Build a workout and fitness app with exercise library, routines, and progress tracking",
    icon: <Dumbbell className="h-3.5 w-3.5" />,
    color: "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100",
  },
  {
    label: "Learning Platform",
    prompt: "Create an online learning platform with courses, video lessons, quizzes, and certificates",
    icon: <BookOpen className="h-3.5 w-3.5" />,
    color: "bg-cyan-50 text-cyan-600 border-cyan-100 hover:bg-cyan-100",
  },
  {
    label: "Portfolio App",
    prompt: "Build a creative portfolio app to showcase projects, skills, and contact information",
    icon: <Palette className="h-3.5 w-3.5" />,
    color: "bg-violet-50 text-violet-600 border-violet-100 hover:bg-violet-100",
  },
];

interface SuggestionChipsProps {
  onSelect: (prompt: string) => void;
}

export function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-gray-400">
        Quick Ideas
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <button
            key={s.label}
            onClick={() => onSelect(s.prompt)}
            className={`
              inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5
              text-xs font-medium transition-all duration-150 cursor-pointer
              active:scale-95
              ${s.color}
            `}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
