import { describe, expect, it } from "vitest";

import { validateSchoolEditorRequiredFields } from "./school-editor-validation";

describe("validateSchoolEditorRequiredFields", () => {
  it("explains that the ward is missing after a province is selected", () => {
    expect(
      validateSchoolEditorRequiredFields({
        name: "test",
        code: "21231",
        province: "Hồ Chí Minh",
        ward: "",
      }),
    ).toBe("Vui lòng chọn xã/phường của trường.");
  });

  it("requires the school name and code", () => {
    expect(
      validateSchoolEditorRequiredFields({
        name: " ",
        code: "",
        province: "Hồ Chí Minh",
        ward: "Bến Nghé",
      }),
    ).toBe("Vui lòng nhập tên và mã trường.");
  });

  it("accepts a complete school location", () => {
    expect(
      validateSchoolEditorRequiredFields({
        name: "THPT Test",
        code: "21231",
        province: "Hồ Chí Minh",
        ward: "Bến Nghé",
      }),
    ).toBeNull();
  });
});
