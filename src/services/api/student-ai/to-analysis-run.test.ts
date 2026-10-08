import { describe, expect, it } from "vitest";

import { toAnalysisRun } from "./to-analysis-run";
import type { StudentAiOverview } from "./types";

const labels: StudentAiOverview["labels"] = {
  dimensions: {
    barrier: { label: "Rào cản", levels: { high: "Cao", medium: "Vừa", low: "Thấp" } },
    interest: { label: "Quan tâm", levels: { high: "Cao", medium: "Vừa", low: "Thấp" } },
  },
  status: {},
  actions: {},
  needs: {},
  memory_types: {},
};

const overview = (patch: Partial<StudentAiOverview>): StudentAiOverview => ({
  student_id: "s1",
  revision: 3,
  enabled: true,
  state: "idle",
  analysis: null,
  stale: false,
  labels,
  ...patch,
});

const analysis: NonNullable<StudentAiOverview["analysis"]> = {
  student_id: "s1",
  source_revision: 3,
  generated_at: "2026-10-07T01:00:00Z",
  ai_reused: false,
  insight: {
    insight_card: { headline: "Quan tâm nhưng lo học phí", points: ["Hẹn thứ 6"] },
    dimensions: [
      {
        code: "barrier",
        level: "high",
        level_source: "ai",
        summary: "Lo học phí",
        missing: ["thu nhập"],
      },
      { code: "interest", level: "high", level_source: "crm" },
    ],
    positives: [{ text: "Chủ động gửi học bạ", refs: [] }],
  },
  nba: {
    run_id: "run-1",
    disposition: "RECOMMEND",
    recheck_at: null,
    items: [
      {
        rank: 1,
        need_code: "TUITION_CONCERN",
        need_score: 0.8,
        action_code: "CALL_PARENT",
        title: "Gọi phụ huynh",
        goal: "Giải đáp học phí",
        why: "Mẹ lo học phí",
        time: "trong tuần",
      },
    ],
  },
};

describe("toAnalysisRun", () => {
  it("has no run before the first analysis", () => {
    expect(toAnalysisRun(overview({}))).toBeNull();
  });

  it("follows crm-ai while it works", () => {
    const run = toAnalysisRun(overview({ state: "running" }));
    expect(run?.status).toBe("running");
    expect(run?.stages[0]?.report).toBeNull();
  });

  it("maps the stored analysis onto the report the 360 cards read", () => {
    const run = toAnalysisRun(overview({ analysis }));
    const report = run?.stages[0]?.report;
    expect(run?.status).toBe("completed");
    expect(run?.runId).toBe("run-1");
    expect(report?.summary).toBe("Quan tâm nhưng lo học phí");
    expect(report?.risks.map((risk) => risk.code)).toEqual(["barrier"]);
    expect(report?.recommendations[0]?.headline).toBe("Gọi phụ huynh");
    expect(report?.opportunities?.[0]?.headline).toBe("Chủ động gửi học bạ");
    expect(report?.missingEvidence).toEqual(["Rào cản: thu nhập"]);
  });
});
