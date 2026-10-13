import { describe, expect, it } from "vitest";
import { profileOptionItems } from "./profile-option-items";

describe("profile option items", () => {
  it("preserves historical text when the current value is absent from active options", () => {
    expect(profileOptionItems([], "Giá trị cũ")).toEqual([
      { id: "", label: "Chưa nhập" },
      {
        id: "Giá trị cũ",
        label: "Giá trị cũ",
        description: "Giá trị hiện có trong hồ sơ",
      },
    ]);
  });
  it("stores profile text and avoids duplicating a selected active name", () => {
    expect(
      profileOptionItems(
        [{ id: "uuid", name: "Việt Nam", code: "VN" }],
        "Việt Nam",
      ).map((item) => item.id),
    ).toEqual(["", "Việt Nam"]);
  });
});
