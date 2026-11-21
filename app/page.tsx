"use client";

import React, { useCallback, useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/home/header";
import { PromptInput, type AttachedFile } from "@/components/home/prompt-input";
import { SuggestionChips } from "@/components/home/suggestion-chips";
import { CommunityShowcase } from "@/components/home/community-showcase";
import { MyProjects } from "@/components/home/my-projects";
import { AuthDialog } from "@/components/home/auth-dialog";
import { ProfileDialog } from "@/components/home/profile-dialog";
import { useSession, signOut } from "@/lib/auth-client";
import { Sparkles, ArrowRight } from "lucide-react";

type AuthMode = "sign-in" | "sign-up";

export default function Home() {
  const router = useRouter();

  // ─── Real auth state via better-auth ───────────────────────────────────
  const { data: session, isPending: isSessionLoading } = useSession();
  const isSignedIn = !!session?.user;
  const user = session?.user;

  // Local override if user updates profile name in this session
  const [updatedName, setUpdatedName] = useState<string | null>(null);

  // ─── Auth & Profile dialog states ──────────────────────────────────────
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogMode, setAuthDialogMode] = useState<AuthMode>("sign-in");
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  // ─── Project creation state ────────────────────────────────────────────
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // ─── Pending prompt (preserved while user authenticates) ───────────────
  const pendingPromptRef = useRef<{
    prompt: string;
    files: AttachedFile[];
  } | null>(null);

  // ─── Suggestion chip → prompt input bridge ─────────────────────────────
  const [externalPrompt, setExternalPrompt] = useState<string>("");

  // Compute profile data
  const displayName = updatedName || user?.name || "Creator";
  const firstName = displayName.split(" ")[0];
  const userCredits =
    (user as Record<string, unknown>)?.credits !== undefined
      ? Number((user as Record<string, unknown>).credits)
      : 100;

  // ─── Open auth dialog helpers ──────────────────────────────────────────
  const openSignIn = useCallback(() => {
    setAuthDialogMode("sign-in");
    setAuthDialogOpen(true);
  }, []);

  const openSignUp = useCallback(() => {
    setAuthDialogMode("sign-up");
    setAuthDialogOpen(true);
  }, []);

  const openProfile = useCallback(() => {
    setProfileDialogOpen(true);
  }, []);

  // ─── Sign out handler ──────────────────────────────────────────────────
  const handleSignOut = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bearer_token");
    }
    try {
      await signOut();
    } catch (e) {
      console.error("Sign out error:", e);
    }
    window.location.reload();
  }, []);

  // ─── Core project creation logic ───────────────────────────────────────
  const createProject = useCallback(
    async (prompt: string, files: AttachedFile[]) => {
      setIsCreatingProject(true);
      setCreateError(null);
      try {
        const formData = new FormData();
        formData.append("prompt", prompt);
        for (const f of files) {
          formData.append("assets", f.file);
        }

        // Send the CloudHike Bearer token so the API route can verify the session
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("bearer_token") || ""
            : "";

        const res = await fetch("/api/projects", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? "Failed to create project");
        }

        const { project } = await res.json();
        router.push(`/workspace/${project.id}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "An error occurred";
        setCreateError(msg);
        setIsCreatingProject(false);
      }
    },
    [router]
  );

  // ─── Auth success handler (Modal email sign in/up) ─────────────────────
  const handleAuthSuccess = useCallback(() => {
    if (pendingPromptRef.current) {
      const { prompt, files } = pendingPromptRef.current;
      pendingPromptRef.current = null;
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("fritz_pending_prompt");
      }
      // Small delay to let the session propagate before submitting
      setTimeout(() => {
        createProject(prompt, files);
      }, 400);
    }
  }, [createProject]);

  // ─── Preserve prompt before social OAuth redirect ──────────────────────
  const handleBeforeSocialRedirect = useCallback(() => {
    if (pendingPromptRef.current && typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          "fritz_pending_prompt",
          JSON.stringify({
            prompt: pendingPromptRef.current.prompt,
            timestamp: Date.now(),
          })
        );
      } catch (err) {
        console.error("Failed to store pending prompt in sessionStorage:", err);
      }
    }
  }, []);

  // ─── Auto-resume prompt if returning from Social OAuth redirect ────────
  useEffect(() => {
    if (isSignedIn && !isSessionLoading && typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("fritz_pending_prompt");
        if (stored) {
          const parsed = JSON.parse(stored);
          sessionStorage.removeItem("fritz_pending_prompt");
          if (parsed?.prompt) {
            // Resume project creation after social redirect
            createProject(parsed.prompt, []);
          }
        }
      } catch (err) {
        console.error("Failed to restore pending prompt from sessionStorage:", err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, isSessionLoading]);

  // ─── Prompt submit handler ─────────────────────────────────────────────
  const handlePromptSubmit = useCallback(
    (prompt: string, files: AttachedFile[]) => {
      if (!isSignedIn) {
        // Save pending prompt then open sign-in dialog
        pendingPromptRef.current = { prompt, files };
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(
              "fritz_pending_prompt",
              JSON.stringify({ prompt, timestamp: Date.now() })
            );
          } catch (err) {
            console.error("Failed to write to sessionStorage:", err);
          }
        }
        setAuthDialogMode("sign-in");
        setAuthDialogOpen(true);
        return;
      }

      // User is already signed in — create the project
      createProject(prompt, files);
    },
    [isSignedIn, createProject]
  );

  const handleSuggestionSelect = useCallback((prompt: string) => {
    setExternalPrompt(prompt);
  }, []);

  const handleExternalPromptConsumed = useCallback(() => {
    setExternalPrompt("");
  }, []);

  const handleProfileUpdated = useCallback((data: { name: string }) => {
    setUpdatedName(data.name);
  }, []);

  const currentUserData = user
    ? {
        name: displayName,
        email: user.email,
        image: user.image,
        credits: userCredits,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 via-white to-gray-50/50">
      {/* ── Full-screen loading overlay while creating project ─────────── */}
      {isCreatingProject && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl shadow-violet-200">
            <Sparkles className="h-7 w-7 text-white animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-gray-900">Creating your project…</p>
            <p className="mt-1 text-sm text-gray-500">Uploading assets and saving to database</p>
          </div>
          <div className="mt-2 flex gap-1">
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="h-2 w-2 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-2 w-2 rounded-full bg-violet-600 animate-bounce" />
          </div>
        </div>
      )}
      {/* Header */}
      <Header
        isSignedIn={isSignedIn}
        user={currentUserData}
        onSignIn={openSignIn}
        onSignUp={openSignUp}
        onSignOut={handleSignOut}
        onOpenProfile={openProfile}
      />

      {/* Auth Dialog (Google, GitHub and Email options) */}
      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        defaultMode={authDialogMode}
        onSuccess={handleAuthSuccess}
        onBeforeSocialRedirect={handleBeforeSocialRedirect}
      />

      {/* Profile Management Dialog */}
      {currentUserData && (
        <ProfileDialog
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
          user={currentUserData}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-100/40 blur-3xl" />
          <div className="absolute -top-20 left-1/4 h-[300px] w-[400px] rounded-full bg-indigo-100/30 blur-3xl" />
          <div className="absolute -top-20 right-1/4 h-[300px] w-[400px] rounded-full bg-purple-100/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 pt-16 pb-14 text-center sm:px-6 sm:pt-24 sm:pb-20">
          {/* Personalized badge when logged in */}
          {isSignedIn && currentUserData ? (
            <div
              onClick={openProfile}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50/90 hover:bg-violet-100/70 px-4 py-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-violet-700">
                Welcome back, {firstName}!
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-xs font-medium text-violet-600 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                {userCredits} free credits
              </span>
              <ArrowRight className="h-3 w-3 text-violet-400" />
            </div>
          ) : (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-violet-500" />
              <span className="text-xs font-semibold text-violet-600">
                AI-Powered Mobile App Builder
              </span>
            </div>
          )}

          {/* Headline */}
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-[1.15]">
            {isSignedIn ? (
              <>
                Hey {firstName}, describe your app,
                <br />
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  we&apos;ll build it in minutes
                </span>
              </>
            ) : (
              <>
                Describe your idea,
                <br />
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  we build the app
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-4 max-w-xl text-sm text-gray-500 sm:text-base leading-relaxed">
            {isSignedIn
              ? "Your CloudHike backend and credits are active. Enter your prompt or attach design mockups below to get started."
              : "Transform your ideas into fully functional mobile apps in minutes. Just describe what you want, and our AI does the rest."}
          </p>

          {/* Prompt Input */}
          <div className="mt-8">
            <PromptInput
              onSubmit={handlePromptSubmit}
              externalPrompt={externalPrompt}
              onExternalPromptConsumed={handleExternalPromptConsumed}
              isLoading={isCreatingProject}
            />
          </div>

          {/* Error banner */}
          {createError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="font-semibold">Error:</span>
              <span>{createError}</span>
              <button
                onClick={() => setCreateError(null)}
                className="ml-auto text-red-400 hover:text-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* Suggestion Chips */}
          <SuggestionChips onSelect={handleSuggestionSelect} />
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      {/* Projects Section – switches based on auth state */}
      <section className="py-14 sm:py-20">
        {isSignedIn ? (
          <MyProjects
            user={currentUserData}
            onOpenProfile={openProfile}
            onNewProject={() => {
              window.scrollTo({ top: 200, behavior: "smooth" });
            }}
          />
        ) : (
          <CommunityShowcase />
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              Fritz builds
            </span>
          </div>
          <p className="text-xs text-gray-400" suppressHydrationWarning>
            © {new Date().getFullYear()} Fritz builds. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
