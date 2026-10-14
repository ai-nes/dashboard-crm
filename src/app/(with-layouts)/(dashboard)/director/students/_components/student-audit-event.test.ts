import { describe, expect, it } from "vitest";

import { formatStudentAuditMetadataValue } from "./student-audit-event";

describe("student audit metadata date display", () => {
  it("formats task due instants in the CRM timezone", () => {
    expect(
      formatStudentAuditMetadataValue(
        "due_at",
        "2026-10-13T16:59:00.000Z",
      ),
    ).toBe("13/10/2026 · 23:59");
  });
});
