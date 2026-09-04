import { describe, expect, it } from "vitest";

import { getStudentZaloConversationTitle } from "./student-activity-utils";

describe("getStudentZaloConversationTitle", () => {
  it("translates technical Chatwoot direction labels", () => {
    expect(getStudentZaloConversationTitle("webchat inbound")).toBe("Tin nhắn đến");
    expect(getStudentZaloConversationTitle("webchat outbound")).toBe("Tin nhắn đã gửi");
  });

  it("keeps meaningful conversation names and applies the default", () => {
    expect(getStudentZaloConversationTitle("Tư vấn học phí")).toBe("Tư vấn học phí");
    expect(getStudentZaloConversationTitle()).toBe("Trao đổi Zalo");
  });
});
