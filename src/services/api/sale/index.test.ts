import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SaleOverviewApiError,
  getSaleOverview,
  normalizeSaleOverview,
} from "./index";
import { getSaleOverviewMock, MOCK_SALE_OVERVIEW } from "./mock";

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
      lostOpportunities: 15,
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
          lostOpportunities: null,
          achievement: null,
          remaining: null,
          expectedEnrollment: null,
          pipelineCoverage: null,
        },
      },
    });

    expect(result.performance).toMatchObject({
      target: null,
      lostOpportunities: null,
      achievement: null,
      remaining: null,
      expectedEnrollment: null,
      pipelineCoverage: null,
    });
  });

  it("normalizes the lost-opportunity count from the API snake_case field", () => {
    const fixture = overviewFixture();
    const result = normalizeSaleOverview({
      ...fixture,
      performance: {
        ...fixture.performance,
        lostOpportunities: undefined,
        lost_opportunities: 15,
      },
    });

    expect(result.performance?.lostOpportunities).toBe(15);
  });

  it("normalizes canonical CRM stages and a compact NBA student projection", () => {
    const fixture = overviewFixture();
    const result = normalizeSaleOverview({
      ...fixture,
      studentStages: {
        total: 3,
        items: [
          { stage: "New", count: 1, share: 33.3 },
          { stage: "Attempting", count: 1, share: 33.3 },
          { stage: "Unknown", count: 1, share: 33.3 },
        ],
      },
      studentActions: [
        {
          student_id: "STU-001",
          student_code: "AI26-0001",
          student_name: "Học sinh thử nghiệm",
          student_stage: "Connected",
          lifecycle_status: "MQL",
          stage_age_days: 4,
          last_activity_at: "2026-09-04T09:00:00+07:00",
          attention_reason: "Đang cân nhắc chương trình.",
          nba: {
            action: { code: "CALL_PARENT", title: "Gọi trao đổi thêm" },
            priority: "high",
            channel: "CALL",
            reason: "Đã hỏi về học phí.",
            explanation: {
              why_now: "Đang chọn giữa hai chương trình.",
              sales_next_step: "Xác nhận ngân sách và gửi phương án phù hợp.",
            },
            timing: { scheduled_at: "2026-09-05T10:00:00+07:00" },
          },
        },
        {
          student_id: "STU-002",
          student_code: "AI26-0002",
          student_name: "Trạng thái chưa biết",
          student_stage: "Consulting",
        },
      ],
    });

    expect(result.studentStages?.items).toEqual([
      { stage: "New", count: 1, share: 50 },
      { stage: "Attempting", count: 1, share: 50 },
    ]);
    expect(result.studentStages?.total).toBe(2);
    expect(result.studentActions).toHaveLength(1);
    expect(result.studentActions?.[0]).toMatchObject({
      studentId: "STU-001",
      studentCode: "AI26-0001",
      studentName: "Học sinh thử nghiệm",
      studentStage: "Connected",
      lifecycleStatus: "MQL",
      stageAgeDays: 4,
      nba: {
        actionCode: "CALL_PARENT",
        title: "Gọi trao đổi thêm",
        priority: "high",
        channel: "CALL",
        whyNow: "Đang chọn giữa hai chương trình.",
        salesNextStep: "Xác nhận ngân sách và gửi phương án phù hợp.",
        scheduledAt: "2026-09-05T10:00:00+07:00",
      },
    });
  });

  it("keeps the new student dashboard projections optional for older API responses", () => {
    const result = normalizeSaleOverview(overviewFixture());

    expect(result.studentStages).toBeUndefined();
    expect(result.studentActions).toBeUndefined();
  });

  it("limits mock priority tasks to the requested dashboard count", async () => {
    const result = await getSaleOverviewMock({ priorityLimit: 4 });

    expect(result.tasks.priority.items.map((task) => task.id)).toEqual([
      "TASK-2026-0005",
      "TASK-2026-0004",
      "TASK-2026-0002",
      "TASK-2026-0001",
    ]);
    expect(result.tasks.priority.overdueCount).toBe(3);
    expect(MOCK_SALE_OVERVIEW.tasks.priority.items).toHaveLength(6);
  });

  it("shows six mock priority tasks in deterministic overdue-first order", async () => {
    const result = await getSaleOverviewMock({ priorityLimit: 6 });

    expect(result.tasks.priority.items.map((task) => task.id)).toEqual([
      "TASK-2026-0005",
      "TASK-2026-0004",
      "TASK-2026-0002",
      "TASK-2026-0001",
      "TASK-2026-0003",
      "TASK-2026-0006",
    ]);
  });

  it("keeps the dev fixture internally consistent", () => {
    const stages = MOCK_SALE_OVERVIEW.pipeline.stages;
    const statusTotal = MOCK_SALE_OVERVIEW.studentStatus.items.reduce((sum, item) => sum + item.count, 0);
    const crmStageTotal = MOCK_SALE_OVERVIEW.studentStages?.items.reduce((sum, item) => sum + item.count, 0);

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
    expect(MOCK_SALE_OVERVIEW.performance?.pipelineCoverage).toBeCloseTo(
      (MOCK_SALE_OVERVIEW.performance?.expectedEnrollment ?? 0) /
        (MOCK_SALE_OVERVIEW.performance?.remaining ?? 1),
    );
    expect(MOCK_SALE_OVERVIEW.pipeline.stages.at(-1)?.count).toBe(
      MOCK_SALE_OVERVIEW.performance?.enrollment,
    );
    expect(stages.every((stage, index) => index === 0 || stage.count <= stages[index - 1].count)).toBe(true);
    expect(statusTotal).toBe(MOCK_SALE_OVERVIEW.studentStatus.total);
    expect(crmStageTotal).toBe(MOCK_SALE_OVERVIEW.studentStages?.total);
    expect(
      MOCK_SALE_OVERVIEW.studentStages?.items.reduce((sum, item) => sum + (item.share ?? 0), 0),
    ).toBeCloseTo(100, 5);
    expect(
      MOCK_SALE_OVERVIEW.studentStages?.items.find((item) => item.stage === "Disqualified")?.count,
    ).toBe(5);
    expect(MOCK_SALE_OVERVIEW.studentActions).toHaveLength(6);
    expect(MOCK_SALE_OVERVIEW.studentActions?.every((item) => [
      "New",
      "Attempting",
      "Connected",
      "Qualified",
      "Disqualified",
    ].includes(item.studentStage))).toBe(true);
    expect(MOCK_SALE_OVERVIEW.performance?.enrollment).toBe(13);
    expect(MOCK_SALE_OVERVIEW.performance?.lostOpportunities).toBe(15);
    expect(
      (MOCK_SALE_OVERVIEW.performance?.enrollment ?? 0) /
        ((MOCK_SALE_OVERVIEW.performance?.enrollment ?? 0) +
          (MOCK_SALE_OVERVIEW.performance?.lostOpportunities ?? 0)) * 100,
    ).toBeCloseTo(46.4, 1);
    expect(MOCK_SALE_OVERVIEW.tasks.summary.today.pending + MOCK_SALE_OVERVIEW.tasks.summary.today.completed).toBe(
      MOCK_SALE_OVERVIEW.tasks.summary.today.total,
    );
    expect(MOCK_SALE_OVERVIEW.health?.followUpDue).toBe(
      MOCK_SALE_OVERVIEW.tasks.summary.today.pending,
    );
    expect(MOCK_SALE_OVERVIEW.tasks.priority.items.filter((task) => task.isOverdue)).toHaveLength(
      MOCK_SALE_OVERVIEW.tasks.priority.overdueCount,
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
