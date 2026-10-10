import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { NbaRecommendation } from "@/services/api/nba";
import StudentNbaRecommendationCard from "./student-nba-recommendation-card";
import StudentNbaDecisionForm from "./student-nba-decision-form";

const recommendation = {
  action: { title: "Gọi để tư vấn hồ sơ", code: "CALL" },
  objective: "Hoàn thiện hồ sơ",
  timing: { scheduledAt: "2026-10-10T08:00:00Z", expiresAt: null },
  generatedAt: "2026-10-09T08:00:00Z",
  expectedRevision: "revision-1",
  permittedDecisions: ["ACCEPT", "ACCEPT_WITH_CHANGES", "REJECT"],
} as NbaRecommendation;

describe("main student NBA card UI", () => {
  const render = (
    values: Partial<NbaRecommendation> = {},
    permissions = { canDecide: true, canAccept: true },
  ) =>
    renderToStaticMarkup(
      <StudentNbaRecommendationCard
        recommendation={{ ...recommendation, ...values }}
        {...permissions}
        onBeginDecision={() => {}}
      />,
    );
  it("shows main card sections and its three decision buttons", () => {
    const html = render();
    expect(html).toContain("Mục tiêu");
    expect(html).toContain("Thời gian");
    expect(html).toContain("Đồng ý");
    expect(html).toContain("Chỉnh sửa");
    expect(html).toContain("Từ chối");
    expect(html).not.toContain("Duyệt và tạo việc");
  });
  it("hides decision actions when the server permits none", () => {
    expect(render({ permittedDecisions: [] })).not.toContain("<button");
  });
  it("hides decision actions without the effective mutation grants", () => {
    expect(render({}, { canDecide: false, canAccept: false })).not.toContain(
      "<button",
    );
  });
  it("keeps rejection available when accept-only grants are missing", () => {
    const html = render({}, { canDecide: true, canAccept: false });
    expect(html).toContain("Từ chối");
    expect(html).not.toContain("Đồng ý");
    expect(html).not.toContain("Chỉnh sửa");
  });
  it("shows only the decisions permitted by the server", () => {
    const html = render({ permittedDecisions: ["REJECT"] });
    expect(html).toContain("Từ chối");
    expect(html).not.toContain("Đồng ý");
    expect(html).not.toContain("Chỉnh sửa");
  });
  it("hides mutations until a recommendation revision is available", () => {
    expect(render({ expectedRevision: null })).not.toContain("<button");
  });
  it("offers only fields the Nest decision endpoint can persist", () => {
    const html = renderToStaticMarkup(
      <StudentNbaDecisionForm
        recommendation={{
          ...recommendation,
          priority: "medium",
          editableFields: ["priority", "due_at"],
        }}
        operation="ACCEPT_WITH_CHANGES"
        isSubmitting={false}
        onCancel={() => {}}
        onSubmit={async () => {}}
      />,
    );
    expect(html).toContain("Mức ưu tiên");
    expect(html).toContain("Hạn xử lý mới");
    expect(html).not.toContain("Kênh xử lý");
  });
});
