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
      actionRequired: 4,
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
        stageId: "connected",
        stageLabel: "Đã kết nối",
        issueCode: "overdue",
        ageDays: 11,
        nextAction: "Xử lý công việc quá hạn",
        lastActivityAt: "2026-09-16 09:00:00",
      },
    ],
    stages: [
      {
        id: "connected",
        label: "Đã kết nối",
        volume: 12,
        nextStepConversion: 50,
        averageDays: 4,
        actionItemCount: 2,
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
        actionItemCount: 2,
        pipeline: {
          newOpportunities: 3,
          followUpDue: 2,
          stageVolumes: { opportunity: 12 },
          stageActionItemCounts: { opportunity: 2 },
          agingBuckets: { "over-10-days": 2 },
          trend: [],
        },
      },
    ],
    trend: [
      {
        period: "Tuần 1",
        stageCounts: { new: 2, attempting: 1, connected: 0, qualified: 1 },
      },
    ],
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
  it("opens the selected priority record even beyond the first three rows", () => {
    const data = toLeadSaleDashboardData({
      ...response,
      dashboard: {
        ...response.dashboard,
        priorityQueue: Array.from({ length: 5 }, (_, index) => ({
          ...response.dashboard.priorityQueue[0],
          id: `student-${index}`,
          name: `Student ${index}`,
          ageDays: 1,
        })),
      },
    });
    const fourth = data.priorityQueue[3];
    expect(data.details[fourth.detailId].records.map((row) => row.id)).toEqual([
      fourth.id,
    ]);
    expect(data.details[fourth.detailId].title).toBe(fourth.name);
  });
  it("keeps zero groups empty and uses the group age instead of its count", () => {
    const data = toLeadSaleDashboardData(response);
    expect(data.details.unassigned.records).toEqual([]);
    expect(data.details.overdue.metrics).toContainEqual({
      label: "Tuổi cao nhất",
      value: "2 ngày",
    });
    expect(
      data.actions.find((action) => action.id === "due-today")?.subtext,
    ).not.toContain("Không có hồ sơ");
  });
  it("does not reuse the priority queue for drilldown groups without matching data", () => {
    const data = toLeadSaleDashboardData(response);
    expect(data.details["due-today"].records).toEqual([]);
    expect(data.details["stage-new"].records).toEqual([]);
  });
  it("maps the API projection into the existing dashboard view model", () => {
    const data = toLeadSaleDashboardData(response);

    expect(data.teamName).toBe("Đội Sale Hà Nội");
    expect(data.summary.enrollment).toBe(8);
    expect(data.priorityQueue[0]).toMatchObject({
      name: "Nguyễn Minh Khôi",
      issue: "Quá hạn xử lý",
      detailId: "record-minh-khoi",
    });
    expect(data.stages[0].detailId).toBe("stage-connected");
    expect(data.agingBuckets).toHaveLength(4);
    expect(data.details.enrollment.metrics[0]).toEqual({
      label: "Đã nhập học",
      value: "8",
    });
  });

  it("keeps unavailable target metrics as N/A instead of fabricating zeroes", () => {
    const data = toLeadSaleDashboardData({
      ...response,
      dashboard: {
        ...response.dashboard,
        summary: {
          ...response.dashboard.summary,
          target: null,
          achievement: null,
          remaining: null,
          coverage: null,
        },
        reps: response.dashboard.reps.map((rep) => ({
          ...rep,
          target: null,
          achievement: null,
          remaining: null,
          coverage: null,
        })),
        trend: [
          {
            period: "Tuần 1",
            stageCounts: { new: 2, attempting: 0, connected: 0, qualified: 0 },
          },
        ],
      },
    });

    expect(data.details.enrollment.metrics).toContainEqual({
      label: "Chỉ tiêu",
      value: "N/A",
    });
    expect(data.details.forecast.metrics).toContainEqual({
      label: "Độ phủ",
      value: "N/A",
    });
    expect(data.details["rep-a"].metrics).toContainEqual({
      label: "Độ phủ",
      value: "N/A",
    });
    expect(data.trend[0].stageCounts.qualified).toBe(0);
  });
});
