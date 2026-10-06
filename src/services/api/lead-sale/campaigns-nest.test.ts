import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const campus = { id: "campus-1", name: "HCM", campusId: undefined };
const team = { id: "team-1", name: "Team A", campusId: "campus-1" };
const campaign = {
  id: "camp-1",
  title: "Spring",
  stableCode: "SPRING",
  status: "ACTIVE",
  campusId: "campus-1",
  startDate: "2026-01-02T00:00:00.000Z",
  endDate: null,
  channelBoundary: null,
  channelUrl: null,
  owningTeamId: "team-1",
};

function respond(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("campaign adapter for the Nest backend", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === "POST") return respond({ data: campaign }, 201);
      if (url.includes("/campuses")) {
        return respond({ data: [campus], meta: { pagination: { total: 1 } } });
      }
      if (url.includes("/teams")) {
        return respond({ data: [team], meta: { pagination: { total: 1 } } });
      }
      if (url.endsWith("/campaigns/camp-1")) return respond({ data: campaign });
      if (url.includes("/campaigns/missing")) return respond({}, 404);
      if (url.includes("/campaigns")) {
        return respond({
          data: [campaign],
          meta: { pagination: { total: 1 } },
        });
      }
      return respond({}, 404);
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("lists campaigns with campus names and routing mapped to the team", async () => {
    const { getCampaignList } = await import("./campaigns");
    const result = await getCampaignList({ search: "spr" });
    expect(result.total).toBe(1);
    expect(result.campaigns[0]).toMatchObject({
      name: "camp-1",
      stableCode: "SPRING",
      title: "Spring",
      campus: "HCM",
      startDate: "2026-01-02",
      leadRoutingEnabled: true,
      leadRoutingTargetType: "Team",
      leadRoutingTargetTeam: "team-1",
    });
    const calledUrls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(calledUrls.some((url) => url.includes("q=spr"))).toBe(true);
  });

  it("returns routing options from teams", async () => {
    const { getCampaignRoutingOptions } = await import("./campaigns");
    expect(await getCampaignRoutingOptions()).toEqual({
      teams: [{ id: "team-1", label: "Team A", campus: "HCM" }],
      groups: [],
    });
  });

  it("returns null for an unknown campaign and sends campus ids on create", async () => {
    const { getCampaign, createCampaign } = await import("./campaigns");
    await expect(getCampaign("missing")).resolves.toBeNull();

    await createCampaign({ title: "New", campus: "HCM", status: "DRAFT" });
    const post = fetchMock.mock.calls.find(
      (call) => (call[1] as RequestInit | undefined)?.method === "POST",
    );
    expect(JSON.parse((post![1] as RequestInit).body as string)).toMatchObject({
      title: "New",
      campusId: "campus-1",
      status: "DRAFT",
    });
  });
});
