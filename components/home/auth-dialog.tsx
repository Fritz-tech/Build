"use client";

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { signIn, signUp } from "@/lib/auth-client";
import {
  Sparkles,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

type AuthMode = "sign-in" | "sign-up";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: AuthMode;
  onSuccess?: () => void;
  onBeforeSocialRedirect?: () => void;
}

// ─── Brand SVG Icons ──────────────────────────────────────────────────────
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

// ─── Form Validation ─────────────────────────────────────────────────────
function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email address";
  return null;
}

function validatePassword(password: string, isSignUp: boolean): string | null {
  if (!password) return "Password is required";
  if (isSignUp && password.length < 8)
    return "Password must be at least 8 characters";
  return null;
}

function validateName(name: string): string | null {
  if (!name.trim()) return "Name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  return null;
}

// ─── Auth Dialog Component ───────────────────────────────────────────────
export function AuthDialog({
  open,
  onOpenChange,
  defaultMode = "sign-in",
  onSuccess,
  onBeforeSocialRedirect,
}: AuthDialogProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Field errors
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const resetForm = useCallback(() => {
    setName("");
    setEmail("");
    setPassword("");
    setErrors({});
    setShowPassword(false);
    setSuccess(false);
    setIsLoading(false);
    setSocialLoading(null);
  }, []);

  const switchMode = useCallback(
    (newMode: AuthMode) => {
      setMode(newMode);
      resetForm();
    },
    [resetForm]
  );

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) resetForm();
      onOpenChange(newOpen);
    },
    [onOpenChange, resetForm]
  );

  // Reset mode when dialog opens
  React.useEffect(() => {
    if (open) {
      setMode(defaultMode);
      resetForm();
    }
  }, [open, defaultMode, resetForm]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (mode === "sign-up") {
      const nameErr = validateName(name);
      if (nameErr) newErrors.name = nameErr;
    }

    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;

    const passErr = validatePassword(password, mode === "sign-up");
    if (passErr) newErrors.password = passErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSocialSignIn = (provider: "google" | "github") => {
    setIsLoading(true);
    setSocialLoading(provider);
    setErrors({});

    try {
      // Save any pending prompt to storage before navigating away
      onBeforeSocialRedirect?.();

      const AUTH_URL =
        process.env.NEXT_PUBLIC_AUTH_URL ||
        "https://cloudhike.dev/api/auth-service/fritz-build-e9j75q";
      const returnTo = new URL("/auth/callback", window.location.origin);

      window.location.assign(
        `${AUTH_URL}/social/${provider}?to=${encodeURIComponent(returnTo.href)}`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : `Failed to connect with ${provider}.`;
      setErrors({ general: msg });
      setIsLoading(false);
      setSocialLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (mode === "sign-up") {
        const result = await signUp.email({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });

        if (result.error) {
          setErrors({
            general:
              result.error.message || "Sign up failed. Please try again.",
          });
          setIsLoading(false);
          return;
        }

        // Store bearer token if returned in response data
        if (result.data) {
          const token =
            (result.data as Record<string, unknown>).token ||
            ((result.data as Record<string, unknown>).session as Record<string, unknown>)?.token;
          if (token && typeof window !== "undefined") {
            localStorage.setItem("bearer_token", String(token));
          }
        }

        // Sign up succeeded – show success briefly then close
        setSuccess(true);
        setTimeout(() => {
          handleOpenChange(false);
          onSuccess?.();
        }, 800);
      } else {
        const result = await signIn.email({
          email: email.trim().toLowerCase(),
          password,
        });

        if (result.error) {
          setErrors({
            general:
              result.error.message || "Invalid email or password.",
          });
          setIsLoading(false);
          return;
        }

        // Store bearer token if returned in response data
        if (result.data) {
          const token =
            (result.data as Record<string, unknown>).token ||
            ((result.data as Record<string, unknown>).session as Record<string, unknown>)?.token;
          if (token && typeof window !== "undefined") {
            localStorage.setItem("bearer_token", String(token));
          }
        }

        setSuccess(true);
        setTimeout(() => {
          handleOpenChange(false);
          onSuccess?.();
        }, 800);
      }
    } catch {
      setErrors({
        general: "Something went wrong. Please try again.",
      });
      setIsLoading(false);
    }
  };

  const isSignUp = mode === "sign-up";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden gap-0"
        showCloseButton={!isLoading}
      >
        {/* Top accent gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />

        <div className="p-6 pb-2">
          <DialogHeader className="items-center text-center gap-3 mb-2">
            {/* Logo */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-200 mx-auto">
              <Sparkles className="h-5.5 w-5.5 text-white" />
            </div>

            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {success
                  ? "Welcome!"
                  : isSignUp
                  ? "Create your account"
                  : "Welcome back"}
              </DialogTitle>
              <DialogDescription className="text-gray-500 mt-1">
                {success
                  ? "You're all set. Redirecting..."
                  : isSignUp
                  ? "Start building apps with 100 free credits"
                  : "Sign in to continue building your apps"}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        {/* Success state */}
        {success ? (
          <div className="flex flex-col items-center gap-3 py-8 px-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 animate-in zoom-in-50">
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              {isSignUp
                ? "Account created! 100 free credits added."
                : "Signed in successfully!"}
            </p>
          </div>
        ) : (
          <div className="px-6 pb-6">
            {/* General error */}
            {errors.general && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-700 animate-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="text-xs leading-relaxed">{errors.general}</span>
              </div>
            )}

            {/* Social Authentication Buttons */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <button
                type="button"
                onClick={() => handleSocialSignIn("google")}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 shadow-xs transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {socialLoading === "google" ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <GoogleIcon className="h-4 w-4 shrink-0" />
                )}
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialSignIn("github")}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 shadow-xs transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {socialLoading === "github" ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <GithubIcon className="h-4 w-4 shrink-0 text-gray-900" />
                )}
                <span>GitHub</span>
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[11px] font-medium text-gray-400">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name field (sign up only) */}
              {isSignUp && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium text-gray-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                      }}
                      disabled={isLoading}
                      aria-invalid={!!errors.name}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              {/* Email field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                    }}
                    disabled={isLoading}
                    aria-invalid={!!errors.email}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignUp ? "Minimum 8 characters" : "Enter password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors((p) => ({ ...p, password: undefined }));
                    }}
                    disabled={isLoading}
                    aria-invalid={!!errors.password}
                    className="pl-9 pr-9 h-9 text-xs"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-violet-300 transition-all disabled:opacity-70 cursor-pointer"
              >
                {isLoading && !socialLoading ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            </form>

            {/* Toggle mode */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                {isSignUp ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("sign-in")}
                      className="font-semibold text-violet-600 hover:text-violet-700 transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("sign-up")}
                      className="font-semibold text-violet-600 hover:text-violet-700 transition-colors cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </p>
            </div>

            {/* Credits badge for sign up */}
            {isSignUp && (
              <div className="mt-3.5 flex justify-center">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-100 px-3 py-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span className="text-[11px] font-medium text-amber-700">
                    100 free credits included automatically
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
