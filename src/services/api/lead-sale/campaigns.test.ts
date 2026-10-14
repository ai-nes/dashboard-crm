import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CampaignApiError,
  createCampaign,
  deleteCampaign,
  getCampaign,
  getCampaignSource,
  getCampaignList,
  getCampaignRoutingOptions,
  normalizeCampaignList,
  updateCampaign,
} from "./campaigns";

const API = "http://localhost:3001";
const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const nestCampaign = {
  id: "CAM-1",
  title: "Tuyển sinh mùa thu 2026",
  stableCode: "CAM-2026-00001",
  status: "ACTIVE",
  campusId: "CAMPUS-A",
  startDate: "2026-09-01T00:00:00.000Z",
  endDate: "2026-09-30T00:00:00.000Z",
  admissionYear: 2027,
  channelBoundary: "Digital",
  channelType: "FACEBOOK_LEAD_FORM",
  channelUrl: "https://example.com/lead-form",
  owningTeamId: null,
  routingGroupId: null,
};

/** Answers the reference-data endpoints the campaign adapter reads. */
function mockReferenceData(overrides: Record<string, () => Response> = {}) {
  fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
    const key = `${init?.method ?? "GET"} ${new URL(url).pathname}`;
    const override = overrides[key];
    if (override) return override();
    switch (key) {
      case "GET /api/v1/reference-data/campuses":
        return json({
          data: [{ id: "CAMPUS-A", name: "Campus A" }],
          meta: { pagination: { total: 1 } },
        });
      case "GET /api/v1/reference-data/teams":
        return json({ data: [], meta: { pagination: { total: 0 } } });
      case "GET /api/v1/reference-data/campaign-routing-groups":
        return json({ data: [] });
      case "GET /api/v1/reference-data/campaigns":
        return json({
          data: [nestCampaign],
          meta: { pagination: { total: 1 } },
        });
      case "GET /api/v1/reference-data/campaigns/CAM-1":
        return json({ data: nestCampaign });
      default:
        return json({ error: { code: "NOT_FOUND", message: "?" } }, 404);
    }
  });
}

const calls = () =>
  fetchMock.mock.calls.map(
    ([url, init]) => `${init?.method ?? "GET"} ${new URL(url).pathname}`,
  );

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("Lead Sale campaign API contract", () => {
  it("reads the exact Lead campaign channel without workforce directory access", async () => {
    mockReferenceData();
    await expect(getCampaignSource("CAM-1")).resolves.toEqual({
      name: "CAM-1",
      title: nestCampaign.title,
      channelType: "FACEBOOK_LEAD_FORM",
    });
    expect(calls()).toEqual(["GET /api/v1/reference-data/campaigns/CAM-1"]);
  });

  it("does not substitute another campaign when the linked campaign is missing", async () => {
    mockReferenceData();
    await expect(getCampaignSource("missing")).rejects.toMatchObject({
      status: 404,
    });
    expect(calls()).toEqual(["GET /api/v1/reference-data/campaigns/missing"]);
  });

  it("loads campaigns with campus names resolved", async () => {
    mockReferenceData();

    const result = await getCampaignList({ search: "thu" });

    const listCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("/reference-data/campaigns"),
    )!;
    expect(String(listCall[0])).toContain("q=thu");
    expect(result).toEqual({
      total: 1,
      campaigns: [
        {
          name: "CAM-1",
          stableCode: "CAM-2026-00001",
          title: "Tuyển sinh mùa thu 2026",
          status: "ACTIVE",
          campus: "Campus A",
          startDate: "2026-09-01",
          endDate: "2026-09-30",
          admissionYear: 2027,
          channelBoundary: "Digital",
          channelType: "FACEBOOK_LEAD_FORM",
          channelUrl: "https://example.com/lead-form",
          leadRoutingEnabled: false,
          leadRoutingTargetType: "",
        },
      ],
    });
  });

  it("gets one campaign by id", async () => {
    mockReferenceData();

    await expect(getCampaign(" CAM-1 ")).resolves.toMatchObject({
      name: "CAM-1",
      stableCode: "CAM-2026-00001",
      campus: "Campus A",
    });
    expect(calls()).toContain("GET /api/v1/reference-data/campaigns/CAM-1");
  });

  it("reads Team Group routing without inventing a Team target", async () => {
    mockReferenceData({
      "GET /api/v1/reference-data/campaigns/CAM-1": () =>
        json({ data: { ...nestCampaign, routingGroupId: "group-1" } }),
    });

    const result = await getCampaign("CAM-1");
    expect(result).toMatchObject({
      leadRoutingEnabled: true,
      leadRoutingTargetType: "Team Group",
      leadRoutingTargetGroup: "group-1",
    });
    expect(result).not.toHaveProperty("leadRoutingTargetTeam");
  });

  it("resolves a campaign code to the persisted UUID record", async () => {
    mockReferenceData();
    await expect(getCampaign("CAM-2026-00001")).resolves.toMatchObject({
      name: nestCampaign.id,
      stableCode: "CAM-2026-00001",
    });
    const lookup = fetchMock.mock.calls.find(([url]) => {
      const parsed = new URL(String(url));
      return (
        parsed.pathname === "/api/v1/reference-data/campaigns" &&
        parsed.searchParams.get("q") === "CAM-2026-00001"
      );
    });
    expect(lookup).toBeDefined();
  });

  it("returns null when the campaign does not exist", async () => {
    mockReferenceData({
      "GET /api/v1/reference-data/campaigns": () =>
        json({ data: [], meta: { pagination: { total: 0 } } }),
    });

    await expect(getCampaign("MISSING")).resolves.toBeNull();
  });

  it("rejects an empty campaign code without calling the API", async () => {
    await expect(getCampaign("  ")).rejects.toMatchObject({
      status: 400,
      code: "INVALID_CAMPAIGN_CODE",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("creates a campaign and reads it back", async () => {
    mockReferenceData({
      "POST /api/v1/reference-data/campaigns": () =>
        json({ data: nestCampaign }, 201),
    });

    const result = await createCampaign({
      title: "Tuyển sinh mùa thu 2026",
      campus: "Campus A",
      status: "UPCOMING",
      startDate: "2026-09-01",
      endDate: "2026-09-30",
      admissionYear: 2027,
      channelBoundary: "Digital",
      channelType: "FACEBOOK_LEAD_FORM",
      channelUrl: "https://example.com/lead-form",
    });

    const create = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "POST",
    )!;
    expect(JSON.parse(create[1].body)).toEqual({
      title: "Tuyển sinh mùa thu 2026",
      status: "UPCOMING",
      startDate: "2026-09-01",
      endDate: "2026-09-30",
      admissionYear: 2027,
      channelBoundary: "Digital",
      channelType: "FACEBOOK_LEAD_FORM",
      channelUrl: "https://example.com/lead-form",
      campusId: "CAMPUS-A",
    });
    expect(result).toMatchObject({ name: "CAM-1", campus: "Campus A" });
  });

  it("updates a campaign with a PATCH", async () => {
    mockReferenceData({
      "PATCH /api/v1/reference-data/campaigns/CAM-1": () =>
        json({ data: nestCampaign }),
    });

    await updateCampaign({
      name: "CAM-1",
      stableCode: "CAM-2026-00001",
      title: "Đợt 2",
      endDate: "2026-10-15",
    });

    const patch = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "PATCH",
    )!;
    expect(JSON.parse(patch[1].body)).toEqual({
      title: "Đợt 2",
      endDate: "2026-10-15",
      stableCode: "CAM-2026-00001",
    });
  });

  it("persists campaign metadata and clears optional dates and URL explicitly", async () => {
    mockReferenceData({
      "PATCH /api/v1/reference-data/campaigns/CAM-1": () =>
        json({ data: nestCampaign }),
    });

    await updateCampaign({
      name: "CAM-1",
      admissionYear: 2027,
      channelType: "FACEBOOK_LEAD_FORM",
      startDate: "",
      endDate: "",
      channelUrl: "",
    });

    const patch = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "PATCH",
    )!;
    expect(JSON.parse(patch[1].body)).toEqual({
      admissionYear: 2027,
      channelType: "FACEBOOK_LEAD_FORM",
      startDate: null,
      endDate: null,
      channelUrl: null,
    });
  });

  it("keeps an existing null year and channel type explicit in PATCH", async () => {
    mockReferenceData({
      "PATCH /api/v1/reference-data/campaigns/CAM-1": () =>
        json({
          data: { ...nestCampaign, admissionYear: null, channelType: null },
        }),
    });

    await updateCampaign({
      name: "CAM-1",
      admissionYear: null,
      channelType: null,
    });

    const patch = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "PATCH",
    )!;
    expect(JSON.parse(patch[1].body)).toEqual({
      admissionYear: null,
      channelType: null,
    });
  });

  it("sets exactly the selected Team Group routing target", async () => {
    mockReferenceData({
      "PATCH /api/v1/reference-data/campaigns/CAM-1": () =>
        json({ data: nestCampaign }),
    });

    await updateCampaign({
      name: "CAM-1",
      leadRoutingEnabled: true,
      leadRoutingTargetType: "Team Group",
      leadRoutingTargetGroup: "group-1",
      leadRoutingTargetTeam: "stale-team",
    });

    const patch = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "PATCH",
    )!;
    expect(JSON.parse(patch[1].body)).toMatchObject({
      owningTeamId: null,
      routingGroupId: "group-1",
    });
  });

  it("clears Team Group routing when changing to a Team", async () => {
    mockReferenceData({
      "PATCH /api/v1/reference-data/campaigns/CAM-1": () =>
        json({ data: nestCampaign }),
    });

    await updateCampaign({
      name: "CAM-1",
      leadRoutingEnabled: true,
      leadRoutingTargetType: "Team",
      leadRoutingTargetTeam: "team-1",
      leadRoutingTargetGroup: "stale-group",
    });

    const patch = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "PATCH",
    )!;
    expect(JSON.parse(patch[1].body)).toMatchObject({
      owningTeamId: "team-1",
      routingGroupId: null,
    });
  });

  it("clears both routing targets when campaign routing is disabled", async () => {
    mockReferenceData({
      "PATCH /api/v1/reference-data/campaigns/CAM-1": () =>
        json({ data: nestCampaign }),
    });

    await updateCampaign({
      name: "CAM-1",
      leadRoutingEnabled: false,
      leadRoutingTargetType: "Team Group",
      leadRoutingTargetGroup: "group-1",
      leadRoutingTargetTeam: "stale-team",
    });

    const patch = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "PATCH",
    )!;
    expect(JSON.parse(patch[1].body)).toMatchObject({
      owningTeamId: null,
      routingGroupId: null,
    });
  });

  it("uses actor-scoped eligible Team Group options with their matching campuses", async () => {
    mockReferenceData({
      "GET /api/v1/reference-data/campaign-routing-groups": () =>
        json({
          data: [
            {
              id: "group-1",
              name: "North Group",
              campusIds: ["CAMPUS-A", "CAMPUS-B"],
            },
          ],
        }),
    });

    await expect(getCampaignRoutingOptions()).resolves.toMatchObject({
      groups: [
        {
          id: "group-1",
          label: "North Group",
          campusIds: ["CAMPUS-A", "CAMPUS-B"],
        },
      ],
    });
    expect(calls()).toContain(
      "GET /api/v1/reference-data/campaign-routing-groups",
    );
    expect(calls()).not.toContain("GET /api/v1/team-management/workspace");
  });

  it("deletes a campaign", async () => {
    mockReferenceData({
      "DELETE /api/v1/reference-data/campaigns/CAM-1": () =>
        new Response(null, { status: 204 }),
    });

    await expect(deleteCampaign("CAM-1")).resolves.toEqual({
      deleted: "CAM-1",
    });
  });

  it("normalizes fields used by the campaigns overview", () => {
    expect(
      normalizeCampaignList({
        total: 1,
        campaigns: [
          {
            name: "CAM-1",
            stableCode: "CAM-2026-00001",
            title: "Tuyển sinh mùa thu 2026",
            status: "ACTIVE",
            start_date: "2026-09-01",
            end_date: "2026-09-30",
            admission_year: null,
            channel_boundary: "Digital",
            channel_type: null,
          },
        ],
      }),
    ).toEqual({
      total: 1,
      campaigns: [
        {
          name: "CAM-1",
          stableCode: "CAM-2026-00001",
          title: "Tuyển sinh mùa thu 2026",
          status: "ACTIVE",
          startDate: "2026-09-01",
          endDate: "2026-09-30",
          admissionYear: null,
          channelBoundary: "Digital",
          channelType: null,
        },
      ],
    });
  });

  it("does not use an internal campaign id as the displayed title or code", () => {
    expect(
      normalizeCampaignList({
        total: 1,
        campaigns: [
          {
            name: "8f2d69d0-1795-4c52-a94a-e77c9ef64918",
            stableCode: null,
            status: "ACTIVE",
            admissionYear: null,
            channelType: null,
          },
        ],
      }),
    ).toEqual({
      total: 1,
      campaigns: [
        {
          name: "8f2d69d0-1795-4c52-a94a-e77c9ef64918",
          stableCode: "",
          title: "Chiến dịch chưa có tên",
          status: "ACTIVE",
          admissionYear: null,
          channelType: null,
        },
      ],
    });
  });

  it("rejects an invalid campaign list envelope", () => {
    expect(() => normalizeCampaignList({})).toThrow(
      "Invalid Campaign list response",
    );
  });

  it("exposes the upstream error code", async () => {
    fetchMock.mockImplementation(async () =>
      json({ error: { code: "FORBIDDEN", message: "Không có quyền." } }, 403),
    );

    await expect(getCampaignList()).rejects.toEqual(
      expect.objectContaining<Partial<CampaignApiError>>({
        status: 403,
        code: "FORBIDDEN",
        message: "Không có quyền.",
      }),
    );
  });

  it("keeps the backend field reasons and request ID when a campaign save fails", async () => {
    const details = [
      {
        field: "admissionYear",
        code: "invalid_type",
        message: "Invalid input: expected int, received number",
      },
    ];
    mockReferenceData({
      "POST /api/v1/reference-data/campaigns": () =>
        json(
          {
            error: {
              code: "INVALID_INPUT",
              message: "The request is invalid.",
              details,
              requestId: "campaign-validation-request",
            },
          },
          400,
        ),
    });
    await expect(
      createCampaign({
        title: "Tuyển sinh",
        campus: "Campus A",
        admissionYear: 2027.5,
      }),
    ).rejects.toMatchObject({
      details,
      requestId: "campaign-validation-request",
    });
  });
});
