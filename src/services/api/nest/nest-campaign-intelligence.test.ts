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

describe("campaign intelligence with the Nest backend", () => {
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

  it("loads the lead cohort of one campaign from /api/v1", async () => {
    fetchMock.mockImplementation(() =>
      json({
        meta: { admissionYear: 2026 },
        campaignId: "c1",
        items: [
          {
            id: "s1",
            leadCode: "HS-1",
            name: "A",
            school: "",
            status: "New",
            statusCode: "New",
            statusGroup: "new",
            owner: "",
            source: "",
            contactAttemptCount: 0,
            lastContactAt: null,
            modifiedAt: null,
          },
        ],
        pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      }),
    );
    const { getCampaignLeads } = await import("../campaign-intelligence");
    const result = await getCampaignLeads({
      campaignId: "c1",
      page: 1,
      pageSize: 20,
    });
    expect(result.items[0]).toMatchObject({
      leadCode: "HS-1",
      statusGroup: "new",
    });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/director/campaign-intelligence/leads?campaignId=c1&page=1&pageSize=20",
    );
  });

  it("keeps the backend error code", async () => {
    fetchMock.mockImplementation(() =>
      json({ error: { code: "FORBIDDEN", message: "Không có quyền" } }, 403),
    );
    const { getCampaignIntelligence } =
      await import("../campaign-intelligence");
    await expect(getCampaignIntelligence()).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
    });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/director/campaign-intelligence",
    );
  });
});
