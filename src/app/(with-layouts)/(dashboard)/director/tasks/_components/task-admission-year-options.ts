import type { AdmissionYear } from "@/services/api/admin-catalog";

export interface TaskAdmissionYearOption {
  id: string;
  label: string;
  value: number;
}

export function toTaskAdmissionYearOptions(
  admissionYears: readonly AdmissionYear[],
): TaskAdmissionYearOption[] {
  const options = new Map<number, TaskAdmissionYearOption>();

  for (const admissionYear of admissionYears) {
    if (!/^\d{4}$/.test(admissionYear.year_name)) continue;

    const value = Number(admissionYear.year_name);
    if (options.has(value)) continue;

    options.set(value, {
      id: String(value),
      label: admissionYear.year_name,
      value,
    });
  }

  return [...options.values()].sort((left, right) => right.value - left.value);
}
