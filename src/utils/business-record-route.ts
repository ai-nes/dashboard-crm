import { isUuid } from "./is-uuid";

/** Receive the actual business-code field, never a display placeholder. */
export function getBusinessRouteKey(
  code: string | null | undefined,
  id: string,
): string {
  const businessCode = code?.trim();
  return businessCode && !isUuid(businessCode) ? businessCode : id.trim();
}

export function getCanonicalBusinessRouteUrl(
  pathname: string,
  reference: string,
  code: string | null | undefined,
  search = "",
  hash = "",
): string | null {
  const businessCode = code?.trim();
  if (
    !reference ||
    !businessCode ||
    isUuid(businessCode) ||
    reference === businessCode
  )
    return null;
  const separator = pathname.lastIndexOf("/");
  try {
    if (decodeURIComponent(pathname.slice(separator + 1)) !== reference)
      return null;
  } catch {
    return null;
  }
  return `${pathname.slice(0, separator + 1)}${encodeURIComponent(businessCode)}${search}${hash}`;
}
