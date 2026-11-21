import "server-only";

export interface CloudHikeUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

/**
 * Verify a CloudHike access token with CloudHike itself.
 * Never trust a user ID sent by the browser.
 */
export async function verifyCloudHikeToken(token: string): Promise<CloudHikeUser | null> {
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL ||
    "https://cloudhike.dev/api/auth-service/fritz-build-e9j75q";
  const apiKey = process.env.AUTH_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_AUTH_PUBLISHABLE_KEY ||
    "pk_84PAMqaqP62Wfe73854Zvmmq";

  const response = await fetch(`${authUrl.replace(/\/+$/, "")}/get-session`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-api-key": apiKey,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) {
    throw new Error(`CloudHike session verification failed (${response.status})`);
  }

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const nested = record.data && typeof record.data === "object"
    ? record.data as Record<string, unknown>
    : record;
  const candidate = nested.user && typeof nested.user === "object"
    ? nested.user as Record<string, unknown>
    : null;

  if (!candidate || typeof candidate.id !== "string" ||
      typeof candidate.email !== "string" || !candidate.email.trim()) {
    return null;
  }

  return {
    id: candidate.id,
    email: candidate.email.trim().toLowerCase(),
    name: typeof candidate.name === "string" ? candidate.name : null,
    image: typeof candidate.image === "string" ? candidate.image : null,
  };
}
