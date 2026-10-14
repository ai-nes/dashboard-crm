import {
  nestGetCurrentUser,
  nestLoginWithPassword,
  nestLogout,
  nestSessionUsers,
  nestStartGoogleLogin,
} from "../nest/nest-auth";
import type { CurrentUser, SessionUser } from "./types";

export type * from "./types";

/**
 * Starts Google sign-in on the Nest backend, then navigates to Google. Better
 * Auth sets the session cookie on `/api/auth/callback/google` and sends the
 * browser to `returnTo` (defaults to this dashboard's `/auth/callback`).
 */
export async function startGoogleLogin(
  returnTo?: string,
): Promise<{ ok: boolean; error?: string }> {
  const origin = window.location.origin;
  const result = await nestStartGoogleLogin(
    returnTo ?? `${origin}/auth/callback`,
    `${origin}/login`,
  );
  if (!result.ok) return result;
  window.location.href = result.url;
  return { ok: true };
}

/** Current Better Auth session, or `null` when the caller is signed out. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  return nestGetCurrentUser();
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
