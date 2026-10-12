import { describe, expect, it } from "vitest";

import type { AdmissionYear } from "@/services/api/admin-catalog";

import { toTaskAdmissionYearOptions } from "./task-admission-year-options";

describe("task admission year options", () => {
  it("uses the catalog year label, skips malformed values, and does not select a default", () => {
    const years = [
      { name: "year-new", year_name: "2026", is_active: true },
      { name: "2025", year_name: "2025", is_active: true },
      { name: "year-old", year_name: "not-a-year", is_active: false },
    ] satisfies AdmissionYear[];

    expect(toTaskAdmissionYearOptions(years)).toEqual([
      { id: "2026", label: "2026", value: 2026 },
      { id: "2025", label: "2025", value: 2025 },
    ]);
  });

  it("deduplicates catalog labels without inferring from record ids", () => {
    const years = [
      { name: "2027", year_name: "2026", is_active: true },
      { name: "2026", year_name: "2026", is_active: false },
    ] satisfies AdmissionYear[];

    expect(toTaskAdmissionYearOptions(years)).toEqual([
      { id: "2026", label: "2026", value: 2026 },
    ]);
  });
});
