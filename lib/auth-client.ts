"use client";

import { useCallback, useEffect, useState } from "react";

const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL ||
  "https://cloudhike.dev/api/auth-service/fritz-build-e9j75q";

const AUTH_KEY =
  process.env.NEXT_PUBLIC_AUTH_PUBLISHABLE_KEY ||
  "pk_84PAMqaqP62Wfe73854Zvmmq";

type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  [key: string]: unknown;
};

type AuthResponse = {
  token?: string;
  user?: AuthUser;
  data?: { token?: string; user?: AuthUser };
  message?: string;
  [key: string]: unknown;
};

function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cloudhike-auth-changed"));
  }
}

async function authRequest(
  path: string,
  body?: Record<string, string>,
  token?: string
): Promise<{ data: AuthResponse | null; error: { message: string } | null }> {
  try {
    const response = await fetch(`${AUTH_URL.replace(/\/+$/, "")}/${path}`, {
      method: body ? "POST" : "GET",
      headers: {
        "x-api-key": AUTH_KEY,
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => ({}))) as AuthResponse;
    if (!response.ok) {
      return {
        data: null,
        error: {
          message:
            typeof payload.message === "string"
              ? payload.message
              : `Authentication request failed (${response.status})`,
        },
      };
    }

    const data = (payload.data ?? payload) as AuthResponse;
    const returnedToken = data.token;
    if (returnedToken && typeof window !== "undefined") {
      localStorage.setItem("bearer_token", returnedToken);
      notifyAuthChanged();
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : "Unable to reach the authentication service.",
      },
    };
  }
}

async function signInEmail(credentials: {
  email: string;
  password: string;
}) {
  return authRequest("sign-in/email", credentials);
}

async function signUpEmail(credentials: {
  name: string;
  email: string;
  password: string;
}) {
  return authRequest("sign-up/email", credentials);
}

export const signIn = { email: signInEmail };
export const signUp = { email: signUpEmail };

export async function signOut() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("bearer_token") || "" : "";
  if (token) {
    await authRequest("sign-out", undefined, token);
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem("bearer_token");
    notifyAuthChanged();
  }
}

export function useSession() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isPending, setIsPending] = useState(true);

  const refreshSession = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("bearer_token") || "";
    if (!token) {
      setUser(null);
      setIsPending(false);
      return;
    }

    setIsPending(true);
    const result = await authRequest("get-session", undefined, token);
    if (result.error || !result.data) {
      setUser(null);
      setIsPending(false);
      return;
    }

    const payload = result.data as AuthResponse & {
      session?: { user?: AuthUser };
    };
    const sessionUser =
      payload.user ??
      payload.session?.user ??
      payload.data?.user ??
      null;
    setUser(sessionUser);
    setIsPending(false);
  }, []);

  useEffect(() => {
    void refreshSession();
    const handleChange = () => void refreshSession();
    window.addEventListener("cloudhike-auth-changed", handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener("cloudhike-auth-changed", handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, [refreshSession]);

  return {
    data: user ? { user } : null,
    isPending,
    refetch: refreshSession,
  };
}
