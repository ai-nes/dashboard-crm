import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SaleOverviewApiError,
  getSaleOverview,
  normalizeSaleOverview,
} from "./index";

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
    tasks: {
      priority: { overdueCount: 0, items: [] },
      summary: {
        today: { total: 0, pending: 0, completed: 0 },
        overdue: { count: 0 },
        upcoming: { count: 0, horizonDays: 7 },
      },
    },
    conversionTrend: {
      defaultRange: "4w",
      ranges: {
        "4w": { from: "2026-08-10", to: "2026-09-05", points: [] },
        "12w": { from: "2026-06-15", to: "2026-09-05", points: [] },
      },
    },
    studentStages: {
      total: 2,
      items: [
        { stage: "New", label: "Mới", count: 1, share: 50 },
        { stage: "Connected", label: "Đã kết nối", count: 1, share: 50 },
      ],
    },
    studentActions: [],
    recentLeads: [],
    recentStudents: [],
    health: {
      followUpDue: 6,
      overdue: 3,
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
  it("serializes the query, unwraps message, and normalizes the core snapshot", async () => {
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
    expect(result.studentStages.items).toHaveLength(2);
    expect(result.health.agingBuckets).toHaveLength(3);
    expect(result.conversionTrend.ranges["4w"].points).toEqual([]);
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
      recentLeads: [
        {
          id: "LEAD-001",
          lead_code: "HS-2026-0001",
          name: "Lead mới",
          processing_status: "PROCESSED",
          resolution: "PENDING",
          source: "Website",
          created_at: "2026-09-05T08:00:00+07:00",
        },
      ],
      recentStudents: [
        {
          student: {
            student_id: "STU-001",
            student_code: "AI26-0001",
            student_name: "Học sinh thử nghiệm",
            student_stage: "Connected",
          },
          school: "THPT A",
          major: "Công nghệ thông tin",
          source: "Website",
          latest_activity: "2026-09-05T09:00:00+07:00",
        },
      ],
    });

    expect(result.studentStages.items).toEqual([
      { stage: "New", count: 1, share: 50 },
      { stage: "Attempting", count: 1, share: 50 },
    ]);
    expect(result.studentStages.total).toBe(2);
    expect(result.studentActions).toHaveLength(1);
    expect(result.studentActions[0]).toMatchObject({
      studentId: "STU-001",
      studentCode: "AI26-0001",
      studentName: "Học sinh thử nghiệm",
      studentStage: "Connected",
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
    expect(result.recentLeads[0]).toMatchObject({
      id: "LEAD-001",
      leadCode: "HS-2026-0001",
      processingStatus: "PROCESSED",
    });
    expect(result.recentStudents[0]).toMatchObject({
      school: "THPT A",
      major: "Công nghệ thông tin",
      student: { studentId: "STU-001", studentStage: "Connected" },
    });
  });

  it("does not accept removed target, enrollment, or SLA sections", () => {
    const fixture = overviewFixture();
    expect(() =>
      normalizeSaleOverview({
        ...fixture,
        performance: { target: 20, enrollment: 10 },
        health: { ...fixture.health, slaBreach: 2 },
        conversionTrend: {
          ...fixture.conversionTrend,
          ranges: {
            ...fixture.conversionTrend.ranges,
            "4w": {
              ...fixture.conversionTrend.ranges["4w"],
              points: [{ label: "Tuần 1", periodStart: "2026-08-10", periodEnd: "2026-08-16", consulted: 1, admitted: 1 }],
            },
          },
        },
      }),
    ).not.toThrow();

    const result = normalizeSaleOverview(fixture);
    expect(result).not.toHaveProperty("performance");
    expect(result.health).not.toHaveProperty("slaBreach");
    expect(result.conversionTrend.ranges["4w"].points[0]).toBeUndefined();
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
    expect(() => normalizeSaleOverview({ message: { meta: {}, tasks: {} } })).toThrow(
      "Invalid Sale overview response",
    );
  });
});
