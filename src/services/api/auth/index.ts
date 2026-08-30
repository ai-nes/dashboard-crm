import type { CurrentUser } from "./types";

export type * from "./types";

function frappeBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_FRAPPE_URL || "").replace(/\/+$/, "");
}

/** Forward the browser session cookie when running on the server. */
async function buildHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { Accept: "application/json" };

  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieHeader = (await cookies()).toString();
      if (cookieHeader) headers.Cookie = cookieHeader;
    } catch {
      // Outside a Next.js request context — nothing to forward.
    }
  }

  return headers;
}

async function frappeFetch(path: string): Promise<unknown> {
  const base = frappeBaseUrl();
  if (!base) throw new Error("NEXT_PUBLIC_FRAPPE_URL chưa được cấu hình.");

  const response = await fetch(`${base}${path}`, {
    headers: await buildHeaders(),
    ...(typeof window !== "undefined" ? { credentials: "include" as RequestCredentials } : {}),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Frappe request thất bại (${response.status}): ${path}`);
  }

  return response.json();
}

/** Turn a Frappe `user_image` value into an absolute URL. */
function resolveAvatarUrl(userImage: unknown): string | undefined {
  if (typeof userImage !== "string" || !userImage) return undefined;
  if (/^https?:\/\//i.test(userImage)) return userImage;
  return `${frappeBaseUrl()}${userImage.startsWith("/") ? "" : "/"}${userImage}`;
}

/**
 * Resolve the currently authenticated Frappe user from the session cookie.
 * Returns `null` when nobody is logged in (Frappe reports the "Guest" user).
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const loggedInPayload = (await frappeFetch(
    "/api/method/frappe.auth.get_logged_user",
  )) as { message?: string };
  const userId = loggedInPayload?.message;

  if (!userId || userId === "Guest") return null;

  const fields = encodeURIComponent(
    JSON.stringify(["name", "email", "full_name", "user_image"]),
  );
  const userDocPayload = (await frappeFetch(
    `/api/resource/User/${encodeURIComponent(userId)}?fields=${fields}`,
  )) as { data?: Record<string, unknown> };
  const doc = userDocPayload?.data ?? {};

  return {
    id: typeof doc.name === "string" ? doc.name : userId,
    email: typeof doc.email === "string" ? doc.email : userId,
    fullName:
      typeof doc.full_name === "string" && doc.full_name.trim()
        ? doc.full_name
        : userId,
    avatarUrl: resolveAvatarUrl(doc.user_image),
  };
}
