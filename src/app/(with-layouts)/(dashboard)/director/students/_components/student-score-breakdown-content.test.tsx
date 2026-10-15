import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { StudentScoreBreakdown } from "./student-score-breakdown";
import StudentScoreBreakdownContent from "./student-score-breakdown-content";

const fixture = (): StudentScoreBreakdown => ({
  overallScore: 31,
  weightedScore: 31,
  timeDecayScore: 0,
  negativeScore: 0,
  templateName: "Default Scoring 2026",
  scoringTime: null,
  items: [
    {
      id: "fit",
      label: "Fit",
      description: "Độ phù hợp",
      color: "var(--primary-500)",
      score: 55,
      weight: 40,
      contribution: 22,
    },
    {
      id: "engagement",
      label: "Engagement",
      description: "Tương tác",
      color: "var(--info-500)",
      score: 30,
      weight: 30,
      contribution: 9,
    },
    {
      id: "intent",
      label: "Intent",
      description: "Ý định đăng ký",
      color: "var(--success-500)",
      score: 0,
      weight: 30,
      contribution: 0,
    },
  ],
});
const render = (breakdown: StudentScoreBreakdown) =>
  renderToStaticMarkup(
    createElement(StudentScoreBreakdownContent, { breakdown }),
  );
describe("score explanation", () => {
  it("explains earned criteria without arithmetic", () => {
    const data = fixture();
    data.items[0].reasons = [
      {
        label: "Đang học lớp 12",
        category: "fit",
        ruleId: "r1",
        signal: "grade_12",
        score: 20,
        reason: null,
      },
    ];
    const html = render(data);
    expect(html).toContain("Đang học lớp 12");
    expect(html).toContain("+20");
    expect(html).toContain("Đóng góp 22 điểm vào tổng");
    expect(html).not.toContain("×");
    expect(html).not.toContain("31%");
  });
  it("shows nonzero reductions and the final calculation", () => {
    const html = render({
      ...fixture(),
      timeDecayScore: 3,
      negativeScore: 5,
      overallScore: 23,
      deductions: [
        {
          label: "30 ngày chưa tương tác",
          category: "negative",
          ruleId: "r2",
          signal: "idle",
          score: -5,
          reason: null,
        },
      ],
    });
    expect(html).toContain("30 ngày chưa tương tác");
    expect(html).toContain("−5");
    expect(html).toContain("Trừ 8 điểm vào tổng sau trọng số.");
  });
  it("does not invent contributions when historical weights are absent", () => {
    const data = fixture();
    data.weightedScore = null;
    data.items = data.items.map((item) => ({
      ...item,
      weight: null,
      contribution: null,
    }));
    const html = render(data);
    expect(html).toContain("Lịch sử chưa lưu chi tiết tiêu chí.");
    expect(html).not.toContain("Đóng góp");
    expect(html).not.toContain("+—");
    expect(html).not.toContain("× —%");
  });
});
