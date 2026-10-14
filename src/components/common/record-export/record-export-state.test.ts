import { describe, expect, it } from "vitest";
import type { RecordExportField } from "@/services/api/record-export/types";
import { validateExportDraft } from "./record-export-state";
const fields: RecordExportField[] = [
  {
    id: "status",
    label: "Tình trạng",
    group: "Trạng thái",
    type: "enum",
    operators: ["in", "not_in", "eq"],
    options: [
      { value: "NEW", label: "Mới" },
      { value: "CLOSED", label: "Đã đóng" },
    ],
  },
];
describe("Export enum draft validation", () => {
  it("accepts multiple options and preserves scalar equality", () => {
    for (const condition of [
      { field: "status", operator: "in", value: ["NEW", "CLOSED"] },
      { field: "status", operator: "not_in", value: ["NEW"] },
      { field: "status", operator: "eq", value: "NEW" },
    ])
      expect(
        validateExportDraft(fields, ["status"], {
          logic: "AND",
          conditions: [condition],
        }),
      ).toBeNull();
  });
  it("blocks empty, unknown and malformed selections", () => {
    for (const value of [[], ["INVALID"], "NEW", Array(101).fill("NEW")])
      expect(
        validateExportDraft(fields, ["status"], {
          logic: "AND",
          conditions: [{ field: "status", operator: "in", value }],
        }),
      ).toBeTruthy();
    expect(
      validateExportDraft(fields, ["status"], {
        logic: "AND",
        conditions: [{ field: "status", operator: "eq", value: ["NEW"] }],
      }),
    ).toBeTruthy();
  });
});
