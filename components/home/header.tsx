"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Sparkles,
  Menu,
  X,
  LayoutDashboard,
  Settings,
  LogOut,
  Blocks,
  Coins,
} from "lucide-react";

interface HeaderProps {
  isSignedIn: boolean;
  user?: {
    name: string;
    email: string;
    image?: string | null;
    credits?: number;
  };
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
  onOpenProfile?: () => void;
}

export function Header({
  isSignedIn,
  user,
  onSignIn,
  onSignUp,
  onSignOut,
  onOpenProfile,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-200 transition-transform group-hover:scale-105">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900">
            Fritz builds
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/explore"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            Explore
          </Link>
          <Link
            href="/docs"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            Docs
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            Pricing
          </Link>
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {isSignedIn && user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 shadow-2xs">
                <Sparkles className="h-3 w-3 text-violet-500" />
                <span>{user.credits ?? 100} credits</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <Avatar
                    size="default"
                    className="cursor-pointer ring-2 ring-gray-100 transition-all hover:ring-violet-200"
                  >
                    {user.image && (
                      <AvatarImage src={user.image} alt={user.name} />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 text-xs font-semibold">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div
                    className="px-3 py-2.5 cursor-pointer hover:bg-gray-50/70 rounded-t-lg transition-colors"
                    onClick={onOpenProfile}
                  >
                    <p className="text-sm font-semibold text-gray-900 flex items-center justify-between">
                      <span>{user.name}</span>
                      <span className="text-[10px] text-violet-600 font-normal">Edit</span>
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs">
                      <span className="text-violet-600 font-medium">Balance</span>
                      <span className="font-bold text-violet-900">
                        {user.credits ?? 100} credits
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={onOpenProfile}>
                  <LayoutDashboard className="h-4 w-4 text-gray-400" />
                  Profile & Account
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Blocks className="h-4 w-4 text-gray-400" />
                  Templates
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={onOpenProfile}>
                  <Settings className="h-4 w-4 text-gray-400" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={onSignOut}
                >
                  <LogOut className="h-4 w-4 text-gray-400" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="default"
                className="hidden text-sm font-medium text-gray-600 hover:text-gray-900 sm:inline-flex"
                onClick={onSignIn}
              >
                Sign In
              </Button>
              <Button
                size="default"
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 text-sm font-semibold px-4"
                onClick={onSignUp}
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              href="/explore"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Explore
            </Link>
            <Link
              href="/docs"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Docs
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Pricing
            </Link>
            {!isSignedIn && (
              <>
                <button
                  onClick={onSignIn}
                  className="mt-1 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Sign In
                </button>
                <button
                  onClick={onSignUp}
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-violet-600 hover:bg-violet-50"
                >
                  Get Started
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
