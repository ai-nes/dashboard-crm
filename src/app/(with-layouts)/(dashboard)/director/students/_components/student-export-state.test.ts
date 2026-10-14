import { describe, expect, it } from "vitest";
import {
  validateExportDraft,
  toggleExportColumn,
  exportConfigKey,
  hasCurrentPreview,
} from "./student-export-state";

describe("Student export builder state", () => {
  const fields = [
    {
      id: "score",
      label: "Điểm",
      group: "Đánh giá",
      type: "number" as const,
      operators: ["eq", "gte", "between", "empty"],
    },
    {
      id: "code",
      label: "Mã",
      group: "Chính",
      type: "text" as const,
      operators: ["contains", "eq"],
    },
  ];
  it("requires columns and typed complete conditions but allows exporting without advanced filters", () => {
    expect(
      validateExportDraft(fields, ["code"], { logic: "AND", conditions: [] }),
    ).toBeNull();
    expect(
      validateExportDraft(fields, [], { logic: "AND", conditions: [] }),
    ).toBeTruthy();
    expect(
      validateExportDraft(fields, ["code"], {
        logic: "AND",
        conditions: [{ field: "score", operator: "gte", value: "" }],
      }),
    ).toBeTruthy();
    expect(
      validateExportDraft(fields, ["code"], {
        logic: "AND",
        conditions: [
          { field: "score", operator: "between", value: 10, valueTo: 5 },
        ],
      }),
    ).toBeTruthy();
  });
  it("keeps selected column order and never duplicates a column", () => {
    expect(toggleExportColumn(["code"], "score", true)).toEqual([
      "code",
      "score",
    ]);
    expect(toggleExportColumn(["code", "score"], "code", true)).toEqual([
      "code",
      "score",
    ]);
    expect(toggleExportColumn(["code", "score"], "code", false)).toEqual([
      "score",
    ]);
  });
  it("invalidates preview on filter/column changes and never accepts failed or absent preview", () => {
    const config = {
      columnIds: ["code"],
      filters: {},
      advancedFilters: { logic: "AND" as const, conditions: [] },
    };
    const key = exportConfigKey(config);
    expect(hasCurrentPreview(config, key)).toBe(true);
    expect(hasCurrentPreview({ ...config, columnIds: ["score"] }, key)).toBe(
      false,
    );
    expect(
      hasCurrentPreview(
        { ...config, advancedFilters: { logic: "OR", conditions: [] } },
        key,
      ),
    ).toBe(false);
    expect(hasCurrentPreview(config, undefined)).toBe(false);
  });
});
