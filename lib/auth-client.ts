import { createAuthClient } from "better-auth/react";

const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL ||
  "https://cloudhike.dev/api/auth-service/fritz-build-e9j75q";

const AUTH_KEY =
  process.env.NEXT_PUBLIC_AUTH_PUBLISHABLE_KEY ||
  "pk_84PAMqaqP62Wfe73854Zvmmq";

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
  fetchOptions: {
    headers: {
      "x-api-key": AUTH_KEY,
    },
    auth: {
      type: "Bearer",
      token: () => {
        if (typeof window !== "undefined") {
          return localStorage.getItem("bearer_token") || "";
        }
        return "";
      },
    },
    onSuccess: (ctx) => {
      if (typeof window !== "undefined") {
        const authToken = ctx.response.headers.get("set-auth-token");
        if (authToken) {
          localStorage.setItem("bearer_token", decodeURIComponent(authToken));
        }
      }
    },
  },
});

// Export typed hooks for easy use in components
export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;
