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

describe("school field activity with the Nest backend", () => {
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

  it("sends the filters to the Nest endpoint", async () => {
    fetchMock.mockImplementation(() =>
      json({
        meta: {
          admissionYear: 2026,
          scope: "all",
          scopeLabel: "Toàn bộ cơ sở",
          period: "season",
          asOf: "2026-10-07T09:00:00+07:00",
          timezone: "Asia/Ho_Chi_Minh",
          status: "partial",
          sources: {
            activities: "available",
            plans: "available",
            dataQuality: "unavailable",
            deviceSync: "unavailable",
          },
          warnings: [],
        },
        kpis: [],
        completedActivities: [],
        upcomingActivities: [],
        dataQuality: { unsyncedRecords: 0, team: [], seasonMetrics: [] },
        deviceSync: null,
      }),
    );
    const { getDirectorSchoolFieldActivity } =
      await import("../director-school-field-activity");
    await getDirectorSchoolFieldActivity({
      admissionYear: 2026,
      period: "6m",
      upcomingLimit: 3,
    });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/director/school-field-activity?admissionYear=2026&period=6m&upcomingLimit=3",
    );
  });

  it("maps backend errors", async () => {
    fetchMock.mockImplementationOnce(() =>
      json({ error: { code: "FORBIDDEN", message: "Không có quyền" } }, 403),
    );
    const {
      getDirectorSchoolFieldActivity,
      DirectorSchoolFieldActivityApiError,
    } = await import("../director-school-field-activity");
    await expect(getDirectorSchoolFieldActivity()).rejects.toBeInstanceOf(
      DirectorSchoolFieldActivityApiError,
    );
  });
});
