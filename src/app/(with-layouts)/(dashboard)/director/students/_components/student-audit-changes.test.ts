import { describe, expect, it } from "vitest";

import {
  formatStudentAuditChangeValue,
} from "./student-audit-changes";

describe("student task audit date display", () => {
  it("uses the CRM-local day for task due dates stored as UTC instants", () => {
    expect(
      formatStudentAuditChangeValue(
        "dueDate",
        "2026-10-13T16:59:00.000Z",
      ),
    ).toBe("13/10/2026");
  });
});
