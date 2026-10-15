import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { StudentInteractionIntents } from "./student-recorded-interaction-intents";
import StudentZaloMessageDetails from "./student-zalo-message-details";
it("shows recorded intent notes without exposing an internal code as the description", () => {
  const html = renderToStaticMarkup(
    <StudentInteractionIntents
      intents={[
        {
          id: "I",
          semantic_key: "TUITION_CONCERN",
          notes: "Phụ huynh cần phương án tài chính.",
        },
      ]}
    />,
  );
  expect(html).toContain("Ý định đã ghi nhận");
  expect(html).toContain("Phụ huynh cần phương án tài chính.");
  expect(html).not.toContain("TUITION_CONCERN");
});
it("labels recorded Zalo summaries and does not invent delivery status", () => {
  const html = renderToStaticMarkup(
    <StudentZaloMessageDetails
      message={{
        id: "I",
        time: "2026-10-14T09:00:00Z",
        senderName: "Người liên hệ",
        recipientName: "Tư vấn viên",
        direction: "inbound",
        content: "Trao đổi đã ghi nhận.",
        isSummary: true,
      }}
    />,
  );
  expect(html).toContain("Tóm tắt trao đổi Zalo");
  expect(html).not.toContain("Đã gửi");
  expect(html).not.toContain("Đã xem");
});
