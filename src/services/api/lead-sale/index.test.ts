import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LeadSaleOverviewApiError,
  getLeadSaleOverview,
  normalizeLeadSaleOverview,
} from "./index";

afterEach(() => vi.restoreAllMocks());

function overviewFixture() {
  return {
    meta: {
      viewer: { id: "lead@example.com", displayName: "Lead Sale" },
      team: { id: "TEAM-1", name: "Đội Sale" },
      admissionYear: 2026,
      date: "2026-09-05",
      asOf: "2026-09-05T09:15:00+07:00",
      timezone: "Asia/Ho_Chi_Minh",
      status: "available",
      warnings: [],
    },
    kpis: [
      { id: "active", value: 2 },
      { id: "new", value: 1 },
      { id: "unassigned", value: 1 },
      { id: "needs-action", value: 1 },
      { id: "overdue", value: 0 },
      { id: "documents", value: 0 },
    ],
    interventions: {
      items: [
        { id: "unassigned", count: 1 },
        { id: "not-contacted", count: 0 },
        { id: "at-risk", count: 0 },
        { id: "blocked", count: 0 },
      ],
    },
    teamPerformance: {
      items: [
        {
          id: "STAFF-1",
          displayName: "Nguyễn Minh Anh",
          activeStudents: 2,
          consulted: 1,
          admitted: 0,
          status: "needs-support",
        },
      ],
    },
    studentStatus: {
      total: 2,
      items: [
        { id: "new", label: "Lead mới", count: 0, share: 0 },
        { id: "attempting", label: "Đang liên hệ", count: 1, share: 50 },
        { id: "connected", label: "Đã kết nối", count: 1, share: 50 },
        { id: "qualified", label: "Đủ điều kiện", count: 0, share: 0 },
        { id: "disqualified", label: "Không đủ điều kiện", count: 0, share: 0 },
      ],
    },
    resultTrend: {
      defaultRange: "4w",
      ranges: {
        "4w": { from: "2026-08-10", to: "2026-09-05", points: [] },
        "3m": { from: "2026-06-05", to: "2026-09-05", points: [] },
      },
    },
    dashboard: {
      summary: {
        enrollment: 0,
        target: 0,
        achievement: 0,
        remaining: 0,
        expected: 0,
        coverage: 0,
        openOpportunities: 0,
        newOpportunities: 0,
        winRate: 0,
        followUpDue: 0,
        overdue: 0,
        actionRequired: 0,
      },
      actions: [
        { id: "overdue", value: 0, longestAgeDays: 0 },
        { id: "unassigned", value: 0, longestAgeDays: 0 },
        { id: "due-today", value: 0, longestAgeDays: 0 },
        { id: "aging", value: 0, longestAgeDays: 0 },
      ],
      detailRecords: [],
      priorityQueue: [],
      stages: ["new", "attempting", "connected", "qualified"].map((id) => ({
        id,
        label: id,
        volume: 0,
        nextStepConversion: null,
        averageDays: 0,
        actionItemCount: 0,
      })),
      reps: [],
      trend: [],
      agingBuckets: [
        { id: "0-2-days", count: 0 },
        { id: "3-5-days", count: 0 },
        { id: "6-10-days", count: 0 },
        { id: "over-10-days", count: 0 },
      ],
      status: "available",
    },
  };
}

describe("Lead Sale overview API contract", () => {
  it("serializes the query, unwraps message, and normalizes the snapshot", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: overviewFixture() }), {
        status: 200,
      }),
    );

    const result = await getLeadSaleOverview(
      { admissionYear: 2026, date: "2026-09-05", timezone: "Asia/Ho_Chi_Minh" },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.lead_sale.get_lead_sale_overview?admissionYear=2026&date=2026-09-05&trendRange=4w&timezone=Asia%2FHo_Chi_Minh&teamMemberLimit=20",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(result.meta.team.name).toBe("Đội Sale");
    expect(result.kpis).toHaveLength(6);
    expect(result.resultTrend.ranges["3m"]).toBeDefined();
  });

  it("maps authorization failures to a stable typed error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: "FORBIDDEN", message: "Not permitted" },
        }),
        {
          status: 403,
        },
      ),
    );

    await expect(
      getLeadSaleOverview({}, { baseUrl: "http://frappe:8000" }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<LeadSaleOverviewApiError>>({
        status: 403,
        code: "FORBIDDEN",
      }),
    );
  });

  it("rejects a response that breaks the status-to-active invariant", () => {
    const fixture = overviewFixture();
    fixture.studentStatus.total = 1;
    expect(() => normalizeLeadSaleOverview({ message: fixture })).toThrow(
      "Incomplete Lead Sale overview response",
    );
  });

  it("rejects a response without the dashboard projection", () => {
    const fixture = { ...overviewFixture(), dashboard: undefined };

    expect(() => normalizeLeadSaleOverview({ message: fixture })).toThrow(
      "Invalid Lead Sale dashboard response",
    );
  });

  it("normalizes drill-down record metadata without changing the dashboard counts", () => {
    const fixture = overviewFixture();
    const response = {
      ...fixture,
      dashboard: {
        ...fixture.dashboard,
        detailRecords: [
          {
            id: "STU-1",
            name: "Hồ sơ chưa phân công",
            owner: "Chưa phân công",
            owner_id: null,
            record_type: "active",
            stage_id: "attempting",
            stage_label: "Đang liên hệ",
            issue_code: "uncontacted",
            action_ids: ["unassigned", "aging"],
            aging_bucket_id: "6-10-days",
            age_days: 7,
            next_action: "Thực hiện tương tác",
            last_activity_at: "2026-09-05 08:00:00",
          },
        ],
      },
    };

    const result = normalizeLeadSaleOverview({ message: response });

    expect(result.dashboard.detailRecords).toEqual([
      expect.objectContaining({
        id: "STU-1",
        ownerId: null,
        recordType: "active",
        stageId: "attempting",
        actionIds: ["unassigned", "aging"],
        agingBucketId: "6-10-days",
        ageDays: 7,
      }),
    ]);
    expect(result.dashboard.summary.actionRequired).toBe(0);
  });
});
