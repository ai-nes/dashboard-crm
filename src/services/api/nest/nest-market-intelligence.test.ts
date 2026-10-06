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

describe("market intelligence with the Nest backend", () => {
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

  it("requests /api/v1/director/market-intelligence with the filters", async () => {
    fetchMock.mockImplementation(() => json({ nothing: true }));
    const { getDirectorMarketIntelligence } =
      await import("../market-intelligence");
    await expect(
      getDirectorMarketIntelligence({
        admissionYear: 2026,
        region: "south",
        schoolLimit: 3,
      }),
    ).rejects.toMatchObject({ status: 502, code: "INVALID_MARKET_RESPONSE" });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/director/market-intelligence?admissionYear=2026&region=south&schoolLimit=3",
    );
  });

  it("keeps the backend error code", async () => {
    fetchMock.mockImplementation(() =>
      json({ error: { code: "FORBIDDEN", message: "Không có quyền" } }, 403),
    );
    const { getDirectorMarketIntelligence } =
      await import("../market-intelligence");
    await expect(getDirectorMarketIntelligence()).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
    });
  });
});
