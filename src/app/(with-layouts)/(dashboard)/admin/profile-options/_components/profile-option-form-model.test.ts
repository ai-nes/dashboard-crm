import { describe, expect, it } from "vitest";
import { profileOptionChanges } from "./profile-option-form-model";
import type { ProfileOption } from "@/services/api/profile-options";

describe("profile catalog edit payload", () => {
  const historical: ProfileOption = {
    id: "old",
    type: "ethnicity",
    code: "OLD",
    name: " Giá trị cũ ",
    isActive: true,
    sortOrder: 0,
  };
  it("keeps unchanged historical name bytes while updating other properties", () => {
    expect(
      profileOptionChanges(
        {
          ...historical,
          name: historical.name.trim(),
          isActive: false,
          sortOrder: 5,
        },
        historical,
      ),
    ).toEqual({ isActive: false, sortOrder: 5 });
  });
  it("sends an actual name change and omits unchanged fields", () => {
    expect(
      profileOptionChanges({ ...historical, name: "Tên mới" }, historical),
    ).toEqual({ name: "Tên mới" });
  });
});
