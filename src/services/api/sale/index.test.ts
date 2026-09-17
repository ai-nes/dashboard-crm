import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SaleOverviewApiError,
  getSaleOverview,
  normalizeSaleOverview,
} from "./index";
import { MOCK_SALE_OVERVIEW } from "./mock";

afterEach(() => vi.restoreAllMocks());

function overviewFixture() {
  return {
    meta: {
      viewer: { id: "sale@example.com", displayName: "Sale" },
      admissionYear: 2026,
      date: "2026-09-05",
      asOf: "2026-09-05T09:15:00+07:00",
      timezone: "Asia/Ho_Chi_Minh",
      status: "available",
      warnings: [],
    },
    kpis: [
      { id: "assigned", value: 2 },
      { id: "consulting", value: 1 },
      { id: "qualified", value: 1 },
      { id: "documents", value: 0 },
      { id: "admission", value: 0 },
    ],
    tasks: {
      priority: { overdueCount: 0, items: [] },
      summary: {
        today: { total: 0, pending: 0, completed: 0 },
        overdue: { count: 0 },
        upcoming: { count: 0, horizonDays: 7 },
      },
    },
    pipeline: {
      stages: [
        "assigned",
        "contacted",
        "consulted",
        "interested",
        "documents",
        "confirmed",
        "admitted",
      ].map((id) => ({ id, label: id, count: id === "assigned" ? 2 : 0 })),
    },
    attention: {
      items: [
        { id: "at-risk", count: 0 },
        { id: "high-intent", count: 1 },
        { id: "blocked", count: 0 },
      ],
    },
    conversionTrend: {
      defaultRange: "4w",
      ranges: {
        "4w": { from: "2026-08-10", to: "2026-09-05", points: [] },
        "12w": { from: "2026-06-15", to: "2026-09-05", points: [] },
      },
    },
    studentStatus: {
      total: 2,
      items: [
        { id: "new", label: "Mới phân công", count: 1, share: 50 },
        { id: "consulting", label: "Đang tư vấn", count: 1, share: 50 },
        { id: "waiting", label: "Chờ phản hồi", count: 0, share: 0 },
        { id: "documents", label: "Đang làm hồ sơ", count: 0, share: 0 },
        { id: "admission", label: "Chờ nhập học", count: 0, share: 0 },
      ],
    },
    operations: {
      total: 0,
      items: [
        { id: "overdue-tasks", count: 0 },
        { id: "missing-documents", count: 0 },
      ],
    },
    performance: {
      target: 20,
      enrollment: 13,
      achievement: 65,
      remaining: 7,
      expectedEnrollment: 9,
      pipelineCoverage: 1.29,
      openOpportunities: 18,
      newOpportunities: 5,
    },
    health: {
      followUpDue: 6,
      overdue: 3,
      slaBreach: 2,
      noActivity: 4,
      agingBuckets: [
        { id: "0-2d", label: "0–2 ngày", count: 8 },
        { id: "3-5d", label: "3–5 ngày", count: 4 },
        { id: "6-10d", label: "6–10 ngày", count: 2 },
      ],
    },
  };
}

describe("Sale overview API contract", () => {
  it("serializes the query, unwraps message, and normalizes the snapshot", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: overviewFixture() }), { status: 200 }),
    );

    const result = await getSaleOverview(
      { admissionYear: 2026, date: "2026-09-05", timezone: "Asia/Ho_Chi_Minh" },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.sale.get_sale_overview?admissionYear=2026&date=2026-09-05&trendRange=4w&timezone=Asia%2FHo_Chi_Minh&priorityLimit=4",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(result.meta.viewer.displayName).toBe("Sale");
    expect(result.kpis).toHaveLength(5);
    expect(result.pipeline.stages).toHaveLength(7);
    expect(result.performance).toMatchObject({
      target: 20,
      enrollment: 13,
      achievement: 65,
      remaining: 7,
      pipelineCoverage: 1.29,
    });
    expect(result.health?.agingBuckets).toHaveLength(3);
  });

  it("keeps unavailable performance values nullable instead of normalizing them to zero", () => {
    const fixture = overviewFixture();
    const result = normalizeSaleOverview({
      message: {
        ...fixture,
        performance: {
          ...fixture.performance,
          target: null,
          achievement: null,
          remaining: null,
          expectedEnrollment: null,
          pipelineCoverage: null,
        },
      },
    });

    expect(result.performance).toMatchObject({
      target: null,
      achievement: null,
      remaining: null,
      expectedEnrollment: null,
      pipelineCoverage: null,
    });
  });

  it("keeps the dev fixture internally consistent", () => {
    const stages = MOCK_SALE_OVERVIEW.pipeline.stages;
    const statusTotal = MOCK_SALE_OVERVIEW.studentStatus.items.reduce((sum, item) => sum + item.count, 0);

    expect(MOCK_SALE_OVERVIEW.performance?.achievement).toBe(
      (MOCK_SALE_OVERVIEW.performance?.enrollment ?? 0) /
        (MOCK_SALE_OVERVIEW.performance?.target ?? 1) * 100,
    );
    expect(MOCK_SALE_OVERVIEW.performance?.remaining).toBe(
      Math.max(
        (MOCK_SALE_OVERVIEW.performance?.target ?? 0) -
          (MOCK_SALE_OVERVIEW.performance?.enrollment ?? 0),
        0,
      ),
    );
    expect(stages.every((stage, index) => index === 0 || stage.count <= stages[index - 1].count)).toBe(true);
    expect(statusTotal).toBe(MOCK_SALE_OVERVIEW.studentStatus.total);
    expect(MOCK_SALE_OVERVIEW.tasks.summary.today.pending + MOCK_SALE_OVERVIEW.tasks.summary.today.completed).toBe(
      MOCK_SALE_OVERVIEW.tasks.summary.today.total,
    );
  });

  it("maps authorization failures to a stable typed error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: { code: "FORBIDDEN", message: "Not permitted" } }), {
        status: 403,
      }),
    );

    await expect(
      getSaleOverview({}, { baseUrl: "http://frappe:8000" }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<SaleOverviewApiError>>({
        status: 403,
        code: "FORBIDDEN",
      }),
    );
  });

  it("rejects an incomplete response instead of rendering fixture data", () => {
    expect(() => normalizeSaleOverview({ message: { meta: {}, kpis: [] } })).toThrow(
      "Invalid Sale overview response",
    );
  });
});
