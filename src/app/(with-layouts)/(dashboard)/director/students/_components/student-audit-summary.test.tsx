import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getStudentAuditChanges } from "./student-audit-changes";
import StudentAuditFieldChanges from "./student-audit-field-changes";
import { summarizeStudentAuditValue } from "./student-audit-summary";
import type { StudentAuditLog } from "@/services/api/student-audit";

describe("compact student audit", () => {
  it("summarizes document counts without expanding checklist IDs", () => {
    expect(
      summarizeStudentAuditValue("documentCompleteness", {
        total: 12,
        completed: 1,
        missing: ["IDENTITY_PROOF", "GRADUATION_PROOF"],
        groups: [{ instruction: "Long checklist" }],
      }),
    ).toBe("Tổng: 12 · Hoàn tất: 1 · Còn thiếu: 2");
    expect(
      summarizeStudentAuditValue("documentCompleteness", {
        total: 4,
        verified: 2,
      }),
    ).toBe("Tổng: 4 · Đã xác minh: 2");
  });

  it("shows the insight headline and opens details in a dialog instead of the timeline", () => {
    const markup = renderToStaticMarkup(
      <StudentAuditFieldChanges
        action="updated"
        changes={[
          {
            fieldname: "insight",
            fieldLabel: "Tóm tắt phân tích",
            oldValue: { insight_card: { headline: "Nội dung trước" } },
            newValue: {
              insight_card: { headline: "Gia đình còn cân đối học phí" },
              dimensions: [{ summary: "Bằng chứng chi tiết" }],
            },
          },
        ]}
      />,
    );
    expect(markup).toContain("Gia đình còn cân đối học phí");
    expect(markup).toContain("Xem chi tiết");
    expect(markup).toContain('aria-haspopup="dialog"');
    expect(markup).not.toContain("Bằng chứng chi tiết");
    expect(markup).not.toContain("Nội dung trước");
  });

  it("bounds long text and handles empty or unknown structured data", () => {
    expect(
      summarizeStudentAuditValue("content", "x".repeat(1000)),
    ).toHaveLength(161);
    expect(summarizeStudentAuditValue("content", null)).toBe("Chưa có giá trị");
    expect(summarizeStudentAuditValue("content", { custom: true })).toBe(
      "1 mục thông tin",
    );
  });

  it("omits analysis hashes and source revisions from display without changing the event", () => {
    const event = {
      action: "created",
      metadata: {
        after: {
          sourceRevision: 2,
          aiBasis: { records: { privateHash: "hash" } },
          insight: { insight_card: { headline: "Tóm tắt" } },
        },
      },
    } as unknown as StudentAuditLog;
    expect(
      getStudentAuditChanges(event).map((change) => change.fieldname),
    ).toEqual(["insight"]);
    expect(event.metadata?.after).toHaveProperty("aiBasis");
  });
});
