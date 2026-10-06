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

describe("director demographics with the Nest backend", () => {
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

  it("requests the overview from /api/v1 and rejects a malformed body", async () => {
    fetchMock.mockImplementation(() => json({ data: {}, meta: {} }));
    const { getDirectorDemographicsOverview } = await import("../demographics");
    await expect(
      getDirectorDemographicsOverview({
        admissionYear: 2026,
        period: "12m",
        page: 2,
        pageSize: 5,
      }),
    ).rejects.toMatchObject({
      status: 502,
      code: "INVALID_DEMOGRAPHICS_RESPONSE",
    });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/director/demographics?admissionYear=2026&period=12m&page=2&pageSize=5",
    );
  });

  it("returns null for a segment that does not exist", async () => {
    fetchMock.mockImplementation(() =>
      json({ error: { code: "SEGMENT_NOT_FOUND", message: "Không có" } }, 404),
    );
    const { getDirectorDemographicsSegment } = await import("../demographics");
    await expect(
      getDirectorDemographicsSegment({
        segment_id: "a b",
        admissionYear: 2026,
      }),
    ).resolves.toBeNull();
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/director/demographics/segments/a%20b?admissionYear=2026",
    );
  });

  it("keeps other error codes", async () => {
    fetchMock.mockImplementation(() =>
      json({ error: { code: "FORBIDDEN", message: "Không có quyền" } }, 403),
    );
    const { getDirectorDemographicsOverview } = await import("../demographics");
    await expect(getDirectorDemographicsOverview()).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
    });
  });
});
