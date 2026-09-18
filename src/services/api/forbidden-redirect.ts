import { QueryCache } from "@tanstack/react-query";

export const ACCESS_DENIED_PATH = "/access-denied";

export function getApiErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;

  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : null;
}

export function isForbiddenApiError(error: unknown): boolean {
  return getApiErrorStatus(error) === 403;
}

export function redirectToAccessDenied(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname === ACCESS_DENIED_PATH) return;

  window.location.replace(ACCESS_DENIED_PATH);
}

export function createForbiddenQueryCache(): QueryCache {
  return new QueryCache({
    onError: (error) => {
      if (isForbiddenApiError(error)) redirectToAccessDenied();
    },
  });
}
