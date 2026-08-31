import type { CurrentUser, FrappeMessage } from "./types";

export type * from "./types";

const FRAPPE_URL = (
  process.env.NEXT_PUBLIC_FRAPPE_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

/** Absolute URL of a Frappe whitelisted method. */
function frappeMethod(path: string): string {
  return `${FRAPPE_URL}/api/method/${path}`;
}

/** Resolve a possibly site-relative Frappe asset path (e.g. an avatar) to an absolute URL. */
export function frappeAsset(
  path: string | null | undefined,
): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${FRAPPE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Full-page navigation to Frappe's Google entry point. Frappe issues the guest
 * session cookie, bounces through Google, then redirects the browser back to
 * `returnTo` (defaults to this dashboard's `/auth/callback`).
 */
export function startGoogleLogin(returnTo?: string): void {
  const target = returnTo ?? `${window.location.origin}/auth/callback`;
  window.location.href = `${frappeMethod("crm.api.google_auth.login")}?redirect_to=${encodeURIComponent(target)}`;
}

/**
 * Resolve the current Frappe session. Returns `null` when the caller is not
 * authenticated (guest session, or 401/403) so callers can treat "logged out"
 * as a normal state rather than an error.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  let res: Response;
  try {
    res = await fetch(frappeMethod("crm.api.session.me"), {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
  } catch {
    // Network/CORS failure — surface as "not authenticated" so the guard routes to /login.
    return null;
  }

  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok)
    throw new Error(`Không lấy được phiên đăng nhập (HTTP ${res.status}).`);

  const body = (await res.json()) as FrappeMessage<
    CurrentUser & { user: string | null }
  >;
  if (!body.message || !body.message.user) return null;
  return body.message as CurrentUser;
}

export interface PasswordLoginResult {
  ok: boolean;
  /** User-facing message when `ok` is false. */
  error?: string;
}

/**
 * Email/password login against Frappe's core `login` endpoint. Frappe skips CSRF
 * for guest sessions, so no token is needed. On success the session cookie is set
 * on the Frappe origin and `getCurrentUser` will resolve.
 */
export async function loginWithPassword(
  usr: string,
  pwd: string,
): Promise<PasswordLoginResult> {
  let res: Response;
  try {
    res = await fetch(frappeMethod("login"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({ usr, pwd }),
    });
  } catch {
    return {
      ok: false,
      error: "Không kết nối được máy chủ. Vui lòng thử lại.",
    };
  }

  let data: { message?: string } = {};
  try {
    data = (await res.json()) as { message?: string };
  } catch {
    // Frappe can return an HTML error page on 5xx — fall through to the status check.
  }

  if (res.ok && data.message === "Logged In") return { ok: true };

  if (res.status === 401)
    return { ok: false, error: "Email hoặc mật khẩu không đúng." };
  return {
    ok: false,
    error: data.message || "Đăng nhập thất bại. Vui lòng thử lại.",
  };
}

/** Clear the Frappe session cookie. Errors are swallowed — the client routes to /login regardless. */
export async function logout(): Promise<void> {
  try {
    await fetch(frappeMethod("logout"), { credentials: "include" });
  } catch {
    // ignore — session may already be gone
  }
}
