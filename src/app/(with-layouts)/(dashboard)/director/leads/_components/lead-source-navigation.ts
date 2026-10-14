export function leadDetailHref(leadKey: string, returnTo: string): string {
  const query = new URLSearchParams({ returnTo });
  return `/director/leads/${encodeURIComponent(leadKey)}?${query.toString()}`;
}

export function leadEditHref(detailHref: string): string {
  const target = new URL(detailHref, "http://crm.local");
  target.searchParams.set("edit", "contact");
  return `${target.pathname}${target.search}${target.hash}`;
}

export function leadBackHref(
  returnTo: string | undefined,
  fallback: string,
): string {
  if (!returnTo) return fallback;

  try {
    const target = new URL(returnTo, "http://crm.local");
    const isLocal = target.origin === "http://crm.local";
    const isCampaignDetail =
      /^\/(?:lead-sale|sale|ctv-sale|director)\/campaigns\/[^/]+\/?$/.test(
        target.pathname,
      );
    return isLocal && isCampaignDetail
      ? `${target.pathname}${target.search}${target.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
