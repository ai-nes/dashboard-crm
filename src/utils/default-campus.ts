/** Resolve HCM from the available catalog rather than hardcoding a database ID. */
export function getDefaultCampusOption<T extends { id: string; label: string }>(
  options: readonly T[],
): T | undefined {
  return options.find((option) => {
    const label = option.label
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    return /\bhcm\b|\bho chi minh\b/.test(label);
  });
}
