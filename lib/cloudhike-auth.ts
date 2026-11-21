import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";

export interface CloudHikeUser { id: string; email: string; name?: string | null; image?: string | null }

export async function verifyCloudHikeToken(token: string): Promise<CloudHikeUser | null> {
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "https://cloudhike.dev/api/auth-service/fritz-build-e9j75q";
  const apiKey = process.env.AUTH_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_AUTH_PUBLISHABLE_KEY || "pk_84PAMqaqP62Wfe73854Zvmmq";
  const response = await fetch(`${authUrl.replace(/\/+$/, "")}/get-session`, {
    headers: { Authorization: `Bearer ${token}`, "x-api-key": apiKey, Accept: "application/json" },
    cache: "no-store",
  });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error(`CloudHike session verification failed (${response.status})`);
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data = root.data && typeof root.data === "object" ? root.data as Record<string, unknown> : root;
  const candidate = data.user && typeof data.user === "object" ? data.user as Record<string, unknown> : null;
  if (!candidate || typeof candidate.id !== "string" || typeof candidate.email !== "string" || !candidate.email.trim()) return null;
  return {
    id: candidate.id,
    email: candidate.email.trim().toLowerCase(),
    name: typeof candidate.name === "string" ? candidate.name : null,
    image: typeof candidate.image === "string" ? candidate.image : null,
  };
}

/** Mirror verified CloudHike identity into the app's user table for project ownership. */
export async function getOrCreateAppUser(authUser: CloudHikeUser) {
  const email = authUser.email.toLowerCase();
  await db.insert(user).values({
    id: authUser.id,
    name: authUser.name?.trim() || email.split("@")[0],
    email,
    image: authUser.image ?? null,
    emailVerified: true,
  }).onConflictDoNothing({ target: user.email });
  const [appUser] = await db.select().from(user).where(eq(user.email, email)).limit(1);
  if (!appUser) throw new Error("Unable to load the application user record");
  return appUser;
}
