import { afterEach, describe, expect, it, vi } from "vitest";

import { getSchools } from "@/services/api/student-school-update";
import { searchSchoolDirectory } from "./school-directory-client";

vi.mock("@/services/api/student-school-update", () => ({
  getSchools: vi.fn(),
}));

afterEach(() => vi.resetAllMocks());

describe("school directory identifiers", () => {
  it("keeps the internal key separate from the displayed school code", async () => {
    vi.mocked(getSchools).mockResolvedValue({
      doctype: "CRM High School",
      filters: {},
      schools: [
        {
          name: "school-internal-id",
          fields: { school_code: "THPT-062", school_name: "THPT A" },
        },
      ],
    });

    expect(await searchSchoolDirectory()).toMatchObject([
      { id: "school-internal-id", schoolCode: "THPT-062", name: "THPT A" },
    ]);
  });

  it("does not turn an internal key into a missing code or name", async () => {
    vi.mocked(getSchools).mockResolvedValue({
      doctype: "CRM High School",
      filters: {},
      schools: [{ name: "school-internal-id", fields: {} }],
    });

    expect(await searchSchoolDirectory()).toMatchObject([
      { id: "school-internal-id", schoolCode: "", name: "Chưa có tên trường" },
    ]);
  });
});
