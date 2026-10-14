import { describe, expect, it } from "vitest";
import * as taskPresentation from "./presentation";

describe("CRM task display helpers", () => {
  it("returns a readable label for a canonical task code and hides unknown technical codes", () => {
    expect(taskPresentation.getTaskTypeLabel?.("send_objection_content")).toBe(
      "Gửi thông tin giải đáp băn khoăn",
    );
    expect(
      taskPresentation.getTaskTypeLabel?.(
        "PRIVATE_INTERNAL_CODE",
        "PRIVATE_INTERNAL_CODE",
      ),
    ).toBe("Việc cần làm");
  });

  it("turns rich task HTML into safe preview text without exposing markup or script content", () => {
    expect(
      taskPresentation.getTaskDescriptionPreview?.(
        "<p>test, <strong>bold</strong>, <em>italic</em>, <u>underlined</u> &amp; done</p><script>alert(1)</script>",
      ),
    ).toBe("test, bold, italic, underlined & done");
  });
});
