import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CtvSaleOverviewApiError,
  getCtvSaleOverview,
  normalizeCtvSaleOverview,
} from "./index";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://localhost:3001");
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

function overviewFixture() {
  const range = {
    from: "2026-08-30",
    to: "2026-09-05",
    points: [
      {
        label: "T2",
        periodStart: "2026-08-31",
        periodEnd: "2026-08-31",
        contacts: 2,
        connected: 1,
      },
    ],
    totals: { contacts: 2, connected: 1 },
  };

  return {
    meta: {
      viewer: { id: "ctv@example.com", displayName: "CTV Sale" },
      date: "2026-09-05",
      asOf: "2026-09-05T09:15:00+07:00",
      timezone: "Asia/Ho_Chi_Minh",
      status: "available",
      warnings: [],
    },
    kpis: [
      {
        id: "assigned",
        value: 2,
        deltaValue: null,
        deltaUnit: "count",
        comparisonPeriod: null,
        direction: null,
        ratioOfAssigned: 1,
        tone: "primary",
      },
      {
        id: "uncontacted",
        value: 1,
        deltaValue: null,
        deltaUnit: "count",
        comparisonPeriod: null,
        direction: null,
        ratioOfAssigned: 0.5,
        tone: "warning",
      },
      {
        id: "follow-up",
        value: 1,
        deltaValue: null,
        deltaUnit: "count",
        comparisonPeriod: null,
        direction: null,
        ratioOfAssigned: 0.5,
        tone: "info",
      },
      {
        id: "transfer",
        value: 0,
        deltaValue: null,
        deltaUnit: "count",
        comparisonPeriod: null,
        direction: null,
        ratioOfAssigned: 0,
        tone: "success",
      },
    ],
    tasks: {
      priority: { overdueCount: 0, items: [] },
      summary: {
        today: { total: 0, pending: 0, completed: 0 },
        overdue: { count: 0 },
        upcoming: { count: 0, horizonDays: 7 },
        completion: { completed: 0, total: 0, rate: null },
      },
    },
    studentStatus: {
      total: 2,
      items: [
        { id: "new", label: "Mới nhận", count: 1, share: 50 },
        { id: "consulting", label: "Đang tư vấn", count: 1, share: 50 },
      ],
    },
    contacts: {
      trend: {
        defaultRange: "7d",
        ranges: { "7d": range, "30d": { ...range, from: "2026-08-07" } },
      },
      outcomes: {
        from: "2026-08-07",
        to: "2026-09-05",
        total: 1,
        connectedRate: 100,
        items: [{ id: "connected", label: "Đã kết nối", count: 1, share: 100 }],
      },
    },
  };
}

describe("CTV Sale overview API contract", () => {
  it("serializes the overview query and normalizes data", async () => {
    fetchMock.mockImplementation(
      async () =>
        new Response(JSON.stringify(overviewFixture()), { status: 200 }),
    );

    const result = await getCtvSaleOverview();

    expect(fetchMock.mock.calls[0]![0]).toBe(
      "http://localhost:3001/api/v1/ctv-sale/overview?trendRange=7d&outcomeRange=30d&priorityLimit=3",
    );
    expect(result.meta.viewer.displayName).toBe("CTV Sale");
    expect(result.kpis).toHaveLength(4);
    expect(result.contacts.trend.ranges["30d"].from).toBe("2026-08-07");
  });

  it("maps authorization failures to a stable typed error", async () => {
    fetchMock.mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            error: { code: "FORBIDDEN", message: "Not permitted" },
          }),
          { status: 403 },
        ),
    );

    await expect(getCtvSaleOverview()).rejects.toEqual(
      expect.objectContaining<Partial<CtvSaleOverviewApiError>>({
        status: 403,
        code: "FORBIDDEN",
      }),
    );
  });

  it("rejects an incomplete response instead of rendering fabricated data", () => {
    expect(() =>
      normalizeCtvSaleOverview({ message: { meta: {}, kpis: [] } }),
    ).toThrow("Invalid CTV Sale overview response");
  });
});
