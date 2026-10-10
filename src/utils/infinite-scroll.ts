export function normalizePageSize(pageSize = 20): number {
  return Number.isFinite(pageSize) ? Math.max(1, Math.trunc(pageSize)) : 20;
}

export function isNearScrollBottom(
  element: Pick<HTMLElement, "scrollTop" | "clientHeight" | "scrollHeight">,
  scrollOffset = 16,
): boolean {
  const threshold = Number.isFinite(scrollOffset) ? Math.max(0, scrollOffset) : 16;
  return element.scrollTop + element.clientHeight >= element.scrollHeight - threshold;
}
