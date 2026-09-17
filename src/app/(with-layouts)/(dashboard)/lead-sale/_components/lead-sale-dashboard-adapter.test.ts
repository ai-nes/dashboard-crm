import { describe, expect, it } from "vitest";

import type { LeadSaleOverviewResponse } from "@/services/api/lead-sale";

import { toLeadSaleDashboardData } from "./lead-sale-dashboard-adapter";

const response: LeadSaleOverviewResponse = {
  meta: {
    viewer: { id: "lead-1", displayName: "Lead Sale" },
    team: { id: "team-1", name: "Đội Sale Hà Nội" },
    admissionYear: 2026,
    date: "2026-09-17",
    asOf: "2026-09-17T10:00:00+07:00",
    timezone: "Asia/Ho_Chi_Minh",
    status: "available",
    warnings: [],
  },
  kpis: [],
  interventions: { items: [] },
  teamPerformance: { items: [] },
  studentStatus: { total: 0, items: [] },
  resultTrend: {
    defaultRange: "4w",
    ranges: {
      "4w": { from: "2026-08-24", to: "2026-09-17", points: [] },
      "3m": { from: "2026-06-17", to: "2026-09-17", points: [] },
    },
  },
  dashboard: {
    summary: {
      enrollment: 8,
      target: 20,
      achievement: 40,
      remaining: 12,
      expected: 9,
      coverage: 0.75,
      openOpportunities: 12,
      newOpportunities: 3,
      winRate: 32,
      followUpDue: 2,
      overdue: 1,
      agingOverSla: 4,
    },
    actions: [
      { id: "overdue", value: 1, longestAgeDays: 2 },
      { id: "unassigned", value: 0, longestAgeDays: 0 },
      { id: "due-today", value: 2, longestAgeDays: 0 },
      { id: "aging", value: 4, longestAgeDays: 11 },
    ],
    priorityQueue: [
      {
        id: "student-1",
        name: "Nguyễn Minh Khôi",
        owner: "Nguyễn Minh Anh",
        stageId: "opportunity",
        stageLabel: "Cơ hội",
        issueCode: "overdue",
        ageDays: 11,
        nextAction: "Xử lý công việc quá hạn",
        lastActivityAt: "2026-09-16 09:00:00",
      },
    ],
    stages: [
      {
        id: "opportunity",
        label: "Cơ hội",
        volume: 12,
        nextStepConversion: 50,
        averageDays: 4,
        slaDays: 5,
        stalledCount: 2,
      },
    ],
    reps: [
      {
        id: "staff-1",
        displayName: "Nguyễn Minh Anh",
        target: 0,
        enrollment: 8,
        achievement: 0,
        remaining: 0,
        expected: 4,
        coverage: 0,
        winRate: 32,
        closedOpportunities: 25,
        wonOpportunities: 8,
        openOpportunities: 12,
        overdue: 1,
        avgStageAgeDays: 4,
        agingOverSlaCount: 2,
        pipeline: {
          newOpportunities: 3,
          followUpDue: 2,
          stageVolumes: { opportunity: 12 },
          stageStalledCounts: { opportunity: 2 },
          agingBuckets: { "over-10-days": 2 },
          trend: [],
        },
      },
    ],
    trend: [{ period: "Tuần 1", enrollment: 2, target: 3, newOpportunities: 1 }],
    agingBuckets: [
      { id: "0-2-days", count: 3 },
      { id: "3-5-days", count: 2 },
      { id: "6-10-days", count: 1 },
      { id: "over-10-days", count: 2 },
    ],
    status: "available",
  },
};

describe("Lead Sale dashboard adapter", () => {
  it("maps the API projection into the existing dashboard view model", () => {
    const data = toLeadSaleDashboardData(response);

    expect(data.teamName).toBe("Đội Sale Hà Nội");
    expect(data.summary.enrollment).toBe(8);
    expect(data.priorityQueue[0]).toMatchObject({
      name: "Nguyễn Minh Khôi",
      issue: "Quá hạn xử lý",
      detailId: "record-minh-khoi",
    });
    expect(data.stages[0].detailId).toBe("stage-opportunity");
    expect(data.agingBuckets).toHaveLength(4);
    expect(data.details.enrollment.metrics[0]).toEqual({
      label: "Đã nhập học",
      value: "8",
    });
  });
});
