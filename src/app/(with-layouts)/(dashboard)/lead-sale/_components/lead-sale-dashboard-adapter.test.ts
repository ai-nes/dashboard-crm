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
      { id: "unassigned", value: 1, longestAgeDays: 7 },
      { id: "due-today", value: 1, longestAgeDays: 0 },
      { id: "aging", value: 2, longestAgeDays: 11 },
    ],
    detailRecords: [
      {
        id: "student-1",
        name: "Nguyễn Minh Khôi",
        owner: "Nguyễn Minh Anh",
        ownerId: "staff-1",
        recordType: "active",
        stageId: "connected",
        stageLabel: "Đã kết nối",
        issueCode: "overdue",
        actionIds: ["overdue", "aging"],
        agingBucketId: "over-10-days",
        ageDays: 11,
        nextAction: "Xử lý công việc quá hạn",
        lastActivityAt: "2026-09-16 09:00:00",
      },
      {
        id: "student-2",
        name: "Hồ sơ chưa phân công",
        owner: "Chưa phân công",
        ownerId: null,
        recordType: "active",
        stageId: "attempting",
        stageLabel: "Đang liên hệ",
        issueCode: "uncontacted",
        actionIds: ["unassigned", "aging"],
        agingBucketId: "6-10-days",
        ageDays: 7,
        nextAction: "Thực hiện tương tác",
        lastActivityAt: "2026-09-15 09:00:00",
      },
      {
        id: "student-3",
        name: "Hồ sơ cần liên hệ hôm nay",
        owner: "Nguyễn Minh Anh",
        ownerId: "staff-1",
        recordType: "active",
        stageId: "new",
        stageLabel: "Lead mới",
        issueCode: null,
        actionIds: ["due-today"],
        agingBucketId: "0-2-days",
        ageDays: 1,
        nextAction: "Thực hiện tương tác",
        lastActivityAt: "2026-09-17 09:00:00",
      },
      {
        id: "student-4",
        name: "Hồ sơ đã nhập học",
        owner: "Nguyễn Minh Anh",
        ownerId: "staff-1",
        recordType: "enrolled",
        stageId: "qualified",
        stageLabel: "Đủ điều kiện",
        issueCode: null,
        actionIds: [],
        agingBucketId: null,
        ageDays: 2,
        nextAction: "Đã nhập học",
        lastActivityAt: "2026-09-16 09:00:00",
      },
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
  it("maps the API projection into the existing dashboard view model", () => {
    const data = toLeadSaleDashboardData(response);

    expect(data.teamName).toBe("Đội Sale Hà Nội");
    expect(data.summary.enrollment).toBe(8);
    expect(data.priorityQueue[0]).toMatchObject({
      name: "Nguyễn Minh Khôi",
      issue: "Quá hạn xử lý",
      detailId: "record-minh-khoi",
    });
    expect(data.details.overdue.records.map((record) => record.id)).toEqual([
      "student-1",
    ]);
    expect(data.details.unassigned.records.map((record) => record.id)).toEqual([
      "student-2",
    ]);
    expect(
      data.details["due-today"].records.map((record) => record.id),
    ).toEqual(["student-3"]);
    expect(data.details.aging.records.map((record) => record.id)).toEqual([
      "student-1",
      "student-2",
    ]);
    expect(
      data.details["stage-connected"].records.map((record) => record.id),
    ).toEqual(["student-1"]);
    expect(
      data.details["aging-6-10"].records.map((record) => record.id),
    ).toEqual(["student-2"]);
    expect(data.details["rep-a"].records.map((record) => record.id)).toEqual([
      "student-1",
      "student-3",
      "student-4",
    ]);
    expect(data.details.enrollment.records.map((record) => record.id)).toEqual([
      "student-4",
    ]);
    expect(data.details.overdue.metrics[1]).toEqual({
      label: "Tuổi cao nhất",
      value: "2 ngày",
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
