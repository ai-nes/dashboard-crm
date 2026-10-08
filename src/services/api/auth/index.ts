import {
  nestGetCurrentUser,
  nestLoginWithPassword,
  nestLogout,
  nestSessionUsers,
} from "../nest/nest-auth";
import type { CurrentUser, SessionUser } from "./types";

export type * from "./types";

/*
 * Google sign-in is left unchanged on purpose: it still points at the legacy
 * entry point until Google is configured on the Nest backend. Nothing else in
 * this module talks to Frappe.
 */
const FRAPPE_URL = (
  process.env.NEXT_PUBLIC_FRAPPE_URL ?? "http://localhost:8001"
).replace(/\/+$/, "");

/**
 * Full-page navigation to Frappe's Google entry point. Frappe issues the guest
 * session cookie, bounces through Google, then redirects the browser back to
 * `returnTo` (defaults to this dashboard's `/auth/callback`).
 */
export function startGoogleLogin(returnTo?: string): void {
  const target = returnTo ?? `${window.location.origin}/auth/callback`;
  window.location.href = `${FRAPPE_URL}/api/method/crm.api.google_auth.login?redirect_to=${encodeURIComponent(target)}`;
}

/** Current Better Auth session, or `null` when the caller is signed out. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  return nestGetCurrentUser();
}

/**
 * @deprecated Better Auth sessions use the cookie and an origin check, so there
 * is no CSRF token to send. Remove with the last service that still asks.
 */
export async function getCsrfToken(...args: [baseUrl?: string]): Promise<null> {
  void args;
  return null;
}

/** CRM accounts that can be picked as a task assignee. */
export async function getSessionUsers(): Promise<SessionUser[]> {
  return nestSessionUsers();
}

export interface PasswordLoginResult {
  ok: boolean;
  /** User-facing message when `ok` is false. */
  error?: string;
}

/** Email/password sign-in through Better Auth; the session cookie is set by the API. */
export async function loginWithPassword(
  email: string,
  password: string,
): Promise<PasswordLoginResult> {
  return nestLoginWithPassword(email, password);
}

/** End the session. Errors are swallowed; the client routes to /login regardless. */
export async function logout(): Promise<void> {
  return nestLogout();
}
