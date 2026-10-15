import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import StudentAuditStructuredValue from "./student-audit-structured-value";

describe("readable audit details", () => {
  it("renders insight as Vietnamese labelled sections and evidence lists", () => {
    const markup = renderToStaticMarkup(
      <StudentAuditStructuredValue
        field="insight"
        value={{
          insight_card: {
            headline: "Gia đình cân đối học phí",
            points: ["Hồ sơ đang rà soát"],
            status_label: null,
          },
          dimensions: [
            {
              code: "interest",
              level: "high",
              level_source: "crm",
              summary: "Chủ động tìm hiểu ngành",
              evidence: [
                {
                  ref: {
                    type: "interaction",
                    id: "550e8400-e29b-41d4-a716-446655440000",
                  },
                  note: "Đã gọi tư vấn",
                },
              ],
              missing: [],
            },
          ],
          positives: [{ text: "Quan tâm chương trình" }],
        }}
      />,
    );
    for (const label of [
      "Kết luận",
      "Nhận định chính",
      "Điểm chính",
      "Các khía cạnh phân tích",
      "Quan tâm",
      "Cao",
      "Dữ liệu CRM",
      "Bằng chứng",
      "Tương tác",
      "Đã gọi tư vấn",
      "Điểm tích cực",
    ])
      expect(markup).toContain(label);
    expect(markup).toContain("<ul");
    expect(markup).toContain("<dt");
    expect(markup).not.toMatch(
      /insight_card|level_source|550e8400|Chưa có giá trị|Thông tin còn thiếu/,
    );
  });

  it("preserves zero and false while suppressing empty fields and internal IDs", () => {
    const markup = renderToStaticMarkup(
      <StudentAuditStructuredValue
        field="custom"
        value={{
          total: 0,
          enabled: false,
          id: "internal",
          revision: 9,
          empty: [],
          custom: "Ghi chú giữ nguyên",
        }}
      />,
    );
    expect(markup).toContain("Tổng số");
    expect(markup).toContain(">0</p>");
    expect(markup).toContain("Không");
    expect(markup).toContain("Ghi chú giữ nguyên");
    expect(markup).not.toMatch(/internal|revision|Empty/);
  });

  it("formats document checklist groups with clear labels", () => {
    const markup = renderToStaticMarkup(
      <StudentAuditStructuredValue
        field="documentCompleteness"
        value={{
          total: 12,
          completed: 1,
          groups: [
            {
              section_code: "basic_admission",
              mode: "ALL",
              instruction: "Nộp bản sao chứng thực",
            },
          ],
        }}
      />,
    );
    expect(markup).toContain("Nhóm giấy tờ");
    expect(markup).toContain("Hồ sơ cơ bản");
    expect(markup).toContain("Đầy đủ các giấy tờ");
    expect(markup).toContain("Nộp bản sao chứng thực");
  });
});
