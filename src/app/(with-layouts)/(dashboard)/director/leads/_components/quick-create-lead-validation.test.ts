import { describe, expect, it } from "vitest";
import { validateQuickCreateLeadForm } from "./quick-create-lead-dialog";

const valid = {
  student_name: "QA",
  phone: "0900000000",
  email: "qa@example.test",
  province: "province",
  campaign: "campaign",
};

describe("Quick create Lead field validation", () => {
  it("reports malformed phone together with a missing province", () => {
    expect(
      validateQuickCreateLeadForm({ ...valid, phone: "abc", province: "" }),
    ).toMatchObject({
      phone: "Số điện thoại phải có 10 chữ số, bắt đầu bằng 0 (hoặc +84).",
      province: "Vui lòng chọn tỉnh / thành phố.",
    });
  });
  it.each(["0900000000", "+84900000000", " 0900000000 "])(
    "accepts supported backend phone syntax: %s",
    (phone) => {
      expect(validateQuickCreateLeadForm({ ...valid, phone })).toEqual({});
    },
  );
  it.each(["abc", "1234567890", "090000000", "09000000000", "09 0000 0000"])(
    "rejects unsupported phone syntax: %s",
    (phone) => {
      expect(
        validateQuickCreateLeadForm({ ...valid, phone }).phone,
      ).toBeDefined();
    },
  );
  it("preserves required email and other required fields", () => {
    expect(
      validateQuickCreateLeadForm({
        student_name: "",
        phone: "",
        email: "",
        campaign: "",
        province: "",
      }),
    ).toHaveProperty("email", "Vui lòng nhập email.");
    expect(
      validateQuickCreateLeadForm({ ...valid, email: "bad" }),
    ).toHaveProperty("email", "Email không đúng định dạng.");
  });
});
