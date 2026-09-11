import { describe, expect, it } from "vitest";
import {
  getStudentTagLabel,
  getStudentTagGroupLabel,
  StudentTagCode,
  STUDENT_TAG_LABELS,
  normalizeTagSearch,
} from "./tag-labels";

describe("student tag Vietnamese catalogue", () => {
  it("covers all twelve controlled tag codes", () => {
    expect(Object.values(StudentTagCode)).toHaveLength(12);
    for (const code of Object.values(StudentTagCode)) {
      expect(getStudentTagLabel({ code, label: code })).toBe(
        STUDENT_TAG_LABELS[code],
      );
    }
    expect(
      getStudentTagLabel({
        code: "SPECIAL_ATTENTION",
        label: "Special Attention",
      }),
    ).toBe("Cần quan tâm đặc biệt");
    expect(getStudentTagGroupLabel("ATTENTION")).toBe("Cần chú ý");
  });

  it("keeps custom labels and supports searching without Vietnamese accents", () => {
    expect(
      getStudentTagLabel({ code: "CUSTOM_TAG", label: "Đã tham gia tư vấn" }),
    ).toBe("Đã tham gia tư vấn");
    expect(normalizeTagSearch("Phụ huynh đồng hành")).toContain(
      "phu huynh dong hanh",
    );
    expect(getStudentTagLabel({ label: "" })).toBe("Tag chưa đặt tên");
  });
});
