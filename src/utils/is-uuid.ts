export function isUuid(value: string | null | undefined): boolean {
  return /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(
    value?.trim() ?? "",
  );
}
