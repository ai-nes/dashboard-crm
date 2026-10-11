import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { DirectorNbaRecommendation } from "@/services/api/nba";
import DirectorRecommendationDetail from "./director-recommendation-detail";

const studentId = "8f2d69d0-1795-4c52-a94a-e77c9ef64918";
const recommendation = {
  id: "recommendation-1",
  target: { type: "CRM Lead", id: studentId },
  action: { code: "CALL", title: "Gọi học viên" },
  rank: 1,
  recommendationKey: "recommendation-1",
  studentId,
  studentName: "Nguyễn An",
  actionId: "CALL",
  priority: "high",
  channel: null,
  reason: null,
  objective: "Trao đổi kế hoạch nhập học.",
  context: [],
  timing: { scheduledAt: null, expiresAt: null, timezone: null },
  status: {
    lifecycle: "proposed",
    decision: "pending",
    execution: "not_started",
  },
  aiPayload: {},
  explanation: null,
  ruleDecision: null,
  explanationSource: null,
  evaluation: {
    id: "evaluation-1",
    disposition: "RECOMMEND",
    status: "completed",
  },
  generatedAt: "",
  expectedRevision: null,
  revision: null,
  permittedDecisions: [],
} as DirectorNbaRecommendation;

describe("director recommendation student routes", () => {
  it("uses the looked-up student code for the detail link and identifier", () => {
    const html = renderToStaticMarkup(
      <DirectorRecommendationDetail
        recommendation={recommendation}
        studentNameById={new Map([[studentId, "Nguyễn An"]])}
        studentCodeById={new Map([[studentId, "HS-2026-014"]])}
      />,
    );

    expect(html).toContain(
      'href="/director/students/HS-2026-014?tab=decision"',
    );
    expect(html).toContain("HS-2026-014");
    expect(html).not.toContain(studentId);
  });

  it("uses the id only in the route when the business code is missing", () => {
    const html = renderToStaticMarkup(
      <DirectorRecommendationDetail
        recommendation={recommendation}
        studentNameById={new Map([[studentId, "Nguyễn An"]])}
        studentCodeById={new Map()}
      />,
    );

    const idHref = `href="/director/students/${studentId}?tab=decision"`;
    expect(html).toContain(idHref);
    expect(html).toContain("Chưa có mã học sinh");
    expect(html.replace(idHref, "")).not.toContain(studentId);
  });
});
