"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // CloudHike returns token in hash fragment (#token=... or ?token=...)
      let token: string | null = null;
      let err: string | null = null;

      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        token = hashParams.get("token");
        err = hashParams.get("error");
      }

      if (!token && window.location.search) {
        const searchParams = new URLSearchParams(window.location.search);
        token = searchParams.get("token");
        if (!err) err = searchParams.get("error");
      }

      if (err) {
        setError(err || "Authentication failed.");
        setTimeout(() => {
          router.replace("/");
        }, 2500);
        return;
      }

      if (token) {
        // Store bearer token for CloudHike Auth client
        localStorage.setItem("bearer_token", decodeURIComponent(token));
        // Clean URL history
        window.history.replaceState(null, "", "/");
        // Redirect home where session will auto-hydrate
        router.replace("/");
        return;
      }

      // If neither token nor error, return home
      router.replace("/");
    } catch (e: unknown) {
      console.error("Callback error:", e);
      router.replace("/");
    }
  }, [router]);

  return (
    <div suppressHydrationWarning className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50/80 via-white to-gray-50/50 px-4">
      <div suppressHydrationWarning className="flex flex-col items-center text-center max-w-sm rounded-2xl bg-white p-8 shadow-lg shadow-gray-100 border border-gray-100">
        <div suppressHydrationWarning className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-200 mb-4">
          <Sparkles className="h-6 w-6 text-white" />
        </div>

        {error ? (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Sign in was not completed
            </h2>
            <p className="text-xs text-red-500 mb-4">{error}</p>
            <p className="text-xs text-gray-400">Redirecting you back...</p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Completing authentication...
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Connecting your account with CloudHike
            </p>
            <Spinner className="h-6 w-6 text-violet-600" />
          </>
        )}
      </div>
    </div>
  );
}
