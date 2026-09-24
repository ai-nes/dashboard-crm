const INTERNAL_NAVIGATION_ORIGIN = "https://ai-nes.internal";

export const DETAIL_RETURN_TO_PARAM = "returnTo";

interface SearchParamsLike {
  toString(): string;
}

function formatInternalPath(url: URL): string {
  return `${url.pathname || "/"}${url.search}${url.hash}`;
}

export function getCurrentPath(
  pathname: string,
  searchParams: SearchParamsLike,
): string {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function withReturnTo(href: string, returnTo?: string): string {
  const normalizedReturnTo = returnTo?.trim();
  if (!normalizedReturnTo) return href;

  const url = new URL(href, INTERNAL_NAVIGATION_ORIGIN);
  url.searchParams.set(DETAIL_RETURN_TO_PARAM, normalizedReturnTo);
  return formatInternalPath(url);
}

export function resolveReturnTo(
  candidate: string | null | undefined,
  fallback: string,
): string {
  const normalizedCandidate = candidate?.trim();
  if (
    !normalizedCandidate ||
    !normalizedCandidate.startsWith("/") ||
    normalizedCandidate.startsWith("//")
  ) {
    return fallback;
  }

  try {
    const url = new URL(normalizedCandidate, INTERNAL_NAVIGATION_ORIGIN);
    if (url.origin !== INTERNAL_NAVIGATION_ORIGIN) return fallback;
    return formatInternalPath(url);
  } catch {
    return fallback;
  }
}
