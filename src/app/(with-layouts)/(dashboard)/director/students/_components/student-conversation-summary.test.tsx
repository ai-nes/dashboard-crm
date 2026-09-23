import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import StudentConversationSummary from "./student-conversation-summary";

describe("StudentConversationSummary", () => {
  it("renders the three existing sections from structured data only", () => {
    const markup = renderToStaticMarkup(
      <StudentConversationSummary
        intelligence={{
          summary: "Tóm tắt chung không phải kết quả xử lý.",
          conversation_summary: {
            problem: {
              identified: true,
              description: "Học sinh cần đăng ký học lại môn.",
              evidence_refs: [],
            },
            resolution: {
              status: "unresolved",
              description: "Tư vấn viên hướng dẫn thủ tục đăng ký.",
              evidence_refs: [],
            },
            result: {
              status: "follow_up_required",
              description: "Hồ sơ vẫn đang chờ nhà trường xử lý.",
              next_action: "Sale kiểm tra lại tình trạng hồ sơ.",
              evidence_refs: [],
            },
          },
        }}
        callSummary="Tóm tắt cuộc gọi không phải kết quả xử lý."
      />,
    );
    const text = markup.replace(/<[^>]*>/g, "");

    expect(markup).toContain("Học sinh đã trao đổi");
    expect(markup).toContain("Tư vấn viên đã tư vấn");
    expect(markup).toContain("Kết quả");
    expect(text).toContain("Tình trạng xử lý: Chưa giải quyết");
    expect(markup).toContain("Hồ sơ vẫn đang chờ nhà trường xử lý.");
    expect(markup).toContain("Việc tiếp theo: Sale kiểm tra lại tình trạng hồ sơ.");
    expect(markup).not.toContain("Tóm tắt chung không phải kết quả xử lý.");
    expect(markup).not.toContain("Tóm tắt cuộc gọi không phải kết quả xử lý.");
  });

  it("labels the legacy flat summary without implying a resolution", () => {
    const markup = renderToStaticMarkup(
      <StudentConversationSummary callSummary="Học sinh đang hỏi về hồ sơ." />,
    );

    expect(markup).toContain("Tóm tắt cuộc trò chuyện");
    expect(markup).toContain("Học sinh đang hỏi về hồ sơ.");
    expect(markup).not.toContain("Kết quả");
  });

  it("does not mark an unknown or abstained analysis as resolved", () => {
    const markup = renderToStaticMarkup(
      <StudentConversationSummary
        intelligence={{
          conversation_summary: {
            problem: {
              identified: true,
              description: "Học sinh đang chờ cập nhật hồ sơ.",
              evidence_refs: [],
            },
            resolution: {
              status: "unknown",
              description: "Chưa xác định được tư vấn viên đã xử lý đến đâu.",
              evidence_refs: [],
            },
            result: {
              status: "unknown",
              description: "Chưa xác định được kết quả sau cuộc trao đổi.",
              next_action: "",
              evidence_refs: [],
            },
          },
        }}
      />,
    );
    const text = markup.replace(/<[^>]*>/g, "").replace(/\s+/g, " ");

    expect(text).toContain("Tình trạng xử lý: Chưa đủ thông tin");
    expect(markup).not.toContain("Đã giải quyết");
  });
});
