import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CampaignApiError,
  createCampaign,
  deleteCampaign,
  getCampaign,
  getCampaignList,
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
  channelBoundary: "Digital",
  channelUrl: "https://example.com/lead-form",
  owningTeamId: null,
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
          channelBoundary: "Digital",
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
      channelBoundary: "Digital",
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
      channelBoundary: "Digital",
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
            channel_boundary: "Digital",
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
          channelBoundary: "Digital",
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
});
