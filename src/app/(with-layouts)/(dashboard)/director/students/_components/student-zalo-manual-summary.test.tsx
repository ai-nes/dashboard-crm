import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { StudentZaloMessage } from "@/services/api/students/types";
import StudentZaloTab, { StudentZaloSummary } from "./student-zalo-tab";

const manual: StudentZaloMessage = {
  id: "manual",
  time: "2026-10-02 23:01:00",
  entryKind: "manual_summary",
  recordedBy: "Người tư vấn",
  summary: "Tư vấn học phí",
  notes: "Hẹn gọi lại",
  outcome: "Captured",
  content: "Tư vấn học phí",
  senderName: "",
  recipientName: "",
  direction: "inbound",
};
const actual: StudentZaloMessage = {
  id: "message",
  time: "2026-10-02 22:01:00",
  entryKind: "message",
  senderName: "Học sinh",
  recipientName: "Người tư vấn",
  content: "Em hỏi học phí",
  direction: "inbound",
  status: "read",
};

describe("manual Zalo summaries", () => {
  it("shows author, summary, notes and outcome without invented delivery labels", () => {
    const html = renderToStaticMarkup(<StudentZaloTab messages={[manual]} />);
    for (const text of [
      "Ghi nhận thủ công",
      "Người tư vấn",
      "Tư vấn học phí",
      "Hẹn gọi lại",
      "Đã ghi nhận",
    ])
      expect(html).toContain(text);
    for (const text of ["Tin nhắn đến", "Đã xem", "Gửi đến", "1 tin"])
      expect(html).not.toContain(text);
  });
  it("keeps actual messages and manual summaries distinct in the same tab", () => {
    const html = renderToStaticMarkup(
      <StudentZaloTab messages={[manual, actual]} />,
    );
    for (const text of [
      "Tin nhắn đến",
      "Đã xem",
      "Ghi nhận thủ công",
      "Em hỏi học phí",
      "Tư vấn học phí",
    ])
      expect(html).toContain(text);
    expect(html).toContain("1 tin");
  });
  it("counts manual entries separately and never shows delivery status in the overview", () => {
    const html = renderToStaticMarkup(
      <StudentZaloSummary messages={[manual, actual]} onOpen={() => {}} />,
    );
    expect(html).toContain("ghi nhận thủ công");
    expect(html).toContain("tin nhắn");
    expect(html).not.toContain("Đã xem");
    expect(html).not.toContain("Tin nhắn gần nhất");
  });
});
