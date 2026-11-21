"use client";

import React, { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  User,
  Mail,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    name: string;
    email: string;
    image?: string | null;
    credits?: number;
  };
  onProfileUpdated?: (updatedUser: { name: string }) => void;
}

export function ProfileDialog({
  open,
  onOpenChange,
  user,
  onProfileUpdated,
}: ProfileDialogProps) {
  const [name, setName] = useState(user.name);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state if user prop changes
  React.useEffect(() => {
    if (open) {
      setName(user.name);
      setError(null);
      setSuccess(false);
    }
  }, [open, user.name]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Better-auth client profile update
      if ("updateUser" in authClient && typeof (authClient as unknown as { updateUser: (args: { name: string }) => Promise<{ error?: { message: string } }> }).updateUser === "function") {
        const res = await (authClient as unknown as { updateUser: (args: { name: string }) => Promise<{ error?: { message: string } }> }).updateUser({
          name: name.trim(),
        });
        if (res?.error) {
          setError(res.error.message || "Failed to update profile");
          setIsLoading(false);
          return;
        }
      }

      setSuccess(true);
      onProfileUpdated?.({ name: name.trim() });
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save profile";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        {/* Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />

        <div className="p-6 pb-4">
          <DialogHeader className="items-center text-center gap-3">
            <div className="relative">
              <Avatar size="lg" className="h-16 w-16 ring-4 ring-violet-50 text-base shadow-sm">
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 ring-2 ring-white">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
              </div>
            </div>

            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                {user.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Manage your personal profile and account settings
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Credits Summary Banner */}
          <div className="mt-4 flex items-center justify-between rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50/70 to-indigo-50/40 p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">
                  AI App Generation Credits
                </p>
                <p className="text-[11px] text-gray-500">Free starter balance</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-violet-700">
                {user.credits ?? 100}
              </span>
              <span className="block text-[10px] uppercase font-semibold text-gray-400">
                Credits
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="mt-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-100 px-3 py-2 text-xs text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="profile-name" className="text-xs font-medium text-gray-700">
                Display Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-email" className="text-xs font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="profile-email"
                  type="email"
                  value={user.email}
                  disabled
                  className="pl-9 h-9 text-xs bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-gray-400">
                Email is managed through your authentication provider.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs hover:from-violet-700 hover:to-indigo-700 text-xs gap-1.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner className="h-3.5 w-3.5" />
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
