export function getNextLimit(
  returnedCount: number,
  requestedLimit: number,
  pageSize: number,
  maxLimit: number,
): number | undefined {
  if (returnedCount < requestedLimit || requestedLimit >= maxLimit) return undefined;
  return Math.min(maxLimit, requestedLimit + pageSize);
}
