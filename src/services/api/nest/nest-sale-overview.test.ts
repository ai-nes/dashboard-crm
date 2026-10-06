import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

function json(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

const range = { from: "2026-09-14", to: "2026-10-07", points: [] };
const overview = {
  meta: {
    viewer: { id: "u1", displayName: "Sale" },
    admissionYear: 2026,
    date: "2026-10-07",
    asOf: "2026-10-07T05:00:00.000Z",
    timezone: "Asia/Ho_Chi_Minh",
    status: "available",
    warnings: [],
  },
  tasks: {
    priority: { overdueCount: 1, items: [] },
    summary: {
      today: { total: 0, pending: 0, completed: 0 },
      overdue: { count: 1 },
      upcoming: { count: 0, horizonDays: 7 },
    },
  },
  conversionTrend: {
    defaultRange: "4w",
    ranges: { "4w": range, "12w": range },
  },
  studentStages: { total: 0, items: [] },
  studentActions: [],
  recentLeads: [],
  recentStudents: [],
  health: { followUpDue: 0, overdue: 1, noActivity: 0, agingBuckets: [] },
};

describe("sale overview with the Nest backend", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("loads the snapshot from /api/v1/sale/overview", async () => {
    fetchMock.mockImplementation(() => json(overview));
    const { getSaleOverview } = await import("../sale");
    const result = await getSaleOverview({ admissionYear: 2026 });
    expect(result.tasks.summary.overdue.count).toBe(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/sale/overview?admissionYear=2026&trendRange=4w&priorityLimit=4",
    );
  });

  it("keeps the backend error code", async () => {
    fetchMock.mockImplementation(() =>
      json({ error: { code: "FORBIDDEN", message: "Không có quyền" } }, 403),
    );
    const { getSaleOverview } = await import("../sale");
    await expect(getSaleOverview()).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
    });
  });
});
