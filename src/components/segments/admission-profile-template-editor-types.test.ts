import { describe, expect, it } from "vitest";

import {
  documentTypeLabel,
  includeCurrentOption,
  requirementConditionOptions,
} from "./admission-profile-template-editor-types";

describe("admission catalog display identifiers", () => {
  it("retains an unresolved selection without exposing its stored key", () => {
    expect(includeCurrentOption([], "internal-document-id")).toEqual([
      {
        value: "internal-document-id",
        label: "Giá trị hiện tại (chưa có trong danh mục)",
      },
    ]);
  });

  it("keeps method references usable while displaying a readable missing name", () => {
    expect(
      requirementConditionOptions("method", [
        { id: "internal-method-id", code: "", name: "", sortOrder: 0 },
      ]),
    ).toContainEqual({
      value: "field:application.admission_method=internal-method-id",
      label: "Phương thức: Chưa có tên phương thức",
    });
  });

  it("uses document names or real codes and does not show an unresolved ID", () => {
    expect(documentTypeLabel("missing-id", [])).toBe(
      "Chưa xác định loại giấy tờ",
    );
    expect(
      documentTypeLabel("document-id", [
        { id: "document-id", code: "CCCD", name: "", category: "IDENTITY" },
      ]),
    ).toBe("CCCD");
    expect(
      documentTypeLabel("document-id", [
        {
          id: "document-id",
          code: "CCCD",
          name: "Căn cước",
          category: "IDENTITY",
        },
      ]),
    ).toBe("Căn cước");
    expect(
      documentTypeLabel("CCCD", [
        {
          id: "document-id",
          code: "CCCD",
          name: "Căn cước",
          category: "IDENTITY",
        },
      ]),
    ).toBe("Căn cước");
  });
});
