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

describe("ctv sale overview with the Nest backend", () => {
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

  it("sends the query to /api/v1/ctv-sale/overview", async () => {
    fetchMock.mockImplementation(() => json({}));
    const { getCtvSaleOverview } = await import("../ctv-sale");
    // An empty body fails normalization, which proves the Nest path ran.
    await expect(
      getCtvSaleOverview({ ctvId: "staff-1", trendRange: "30d" }),
    ).rejects.toMatchObject({ status: 502 });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/ctv-sale/overview?trendRange=30d&outcomeRange=30d&ctvId=staff-1&priorityLimit=3",
    );
  });

  it("keeps the backend error code", async () => {
    fetchMock.mockImplementation(() =>
      json({ error: { code: "FORBIDDEN", message: "Không có quyền" } }, 403),
    );
    const { getCtvSaleOverview } = await import("../ctv-sale");
    await expect(getCtvSaleOverview()).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
    });
  });
});
