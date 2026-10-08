import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CampaignIntelligenceApiError, getCampaignIntelligence } from "./index";

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

const respond = (body: unknown, status = 200) =>
  fetchMock.mockImplementation(
    async () => new Response(JSON.stringify(body), { status }),
  );

describe("campaign intelligence API", () => {
  it("maps production fields to the unchanged UI shape", async () => {
    respond({
      generatedAt: "2026-09-02T13:15:00+07:00",
      summary: {
        spend: 100,
        qualifiedLeads: 10,
        applications: 4,
        enrollments: 2,
        confirmedRevenue: 250,
        roas: 2.5,
      },
      trend: [{ label: "W32/2026", spend: 100, confirmedRevenue: 250 }],
      funnel: [
        {
          id: "impressions",
          label: "Impressions",
          value: 1000,
          rate: 100,
        },
        { id: "clicks", label: "Clicks", value: 80, rate: null },
      ],
      campaigns: [
        {
          id: "CAM-1",
          name: "Open Day",
          channel: "Demo Campaign Intelligence Facebook Ads",
          spend: 100,
          qualifiedLeads: 10,
          applications: 4,
          enrollments: 2,
          confirmedRevenue: 250,
          pipelineRevenue: 300,
          roas: 2.5,
          cpql: 10,
          enrollmentRate: 20,
          attributionConfidence: "high",
          health: "on_track",
          leadCount: 3,
          statusBreakdown: [
            { code: "new", label: "Mới", count: 1, share: 33.3 },
            { code: "in_progress", label: "Đang xử lý", count: 1, share: 33.3 },
            {
              code: "converted",
              label: "Đã chuyển đổi",
              count: 1,
              share: 33.3,
            },
          ],
          qualityCount: 0,
        },
      ],
      recommendation: {
        title: "Tăng ngân sách",
        impact: null,
        confidence: "high",
        evidence: ["ROAS tốt"],
      },
    });

    const result = await getCampaignIntelligence();

    expect(fetchMock.mock.calls[0]![0]).toBe(
      "http://localhost:3001/api/v1/director/campaign-intelligence",
    );
    expect(result.funnel).toEqual([
      { label: "Impressions", count: 1000, conversionRate: 100 },
      { label: "Clicks", count: 80 },
    ]);
    expect(result.campaigns[0]?.channel).toBe("Facebook");
    expect(result.campaigns[0]?.leadCount).toBe(3);
    expect(result.campaigns[0]?.statusBreakdown?.[0]?.count).toBe(1);
    expect(result.recommendation.impact).toBe(0);
  });

  it("normalizes the backend items/pagination lead contract", async () => {
    respond({
      meta: { admissionYear: 2026 },
      campaignId: "CAM-1",
      items: [
        {
          leadCode: "STU-1",
          name: "Nguyễn An",
          school: "THPT Demo",
          status: "Mới",
          statusCode: "NEW",
          statusGroup: "new",
          owner: "Sale Demo",
          source: "Facebook",
          contactAttemptCount: 0,
          lastContactAt: null,
          modifiedAt: null,
        },
      ],
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    });

    const { getCampaignLeads } = await import("./index");
    const result = await getCampaignLeads({
      campaignId: "CAM-1",
      page: 1,
      pageSize: 20,
    });

    expect(String(fetchMock.mock.calls[0]![0])).toContain(
      "/api/v1/director/campaign-intelligence/leads?campaignId=CAM-1",
    );
    expect(result.items[0]?.leadCode).toBe("STU-1");
    expect(result.pagination.total).toBe(1);
  });

  it("maps structured API errors", async () => {
    respond({ error: { code: "FORBIDDEN", message: "Không có quyền." } }, 403);

    await expect(getCampaignIntelligence()).rejects.toEqual(
      expect.objectContaining<Partial<CampaignIntelligenceApiError>>({
        status: 403,
        code: "FORBIDDEN",
      }),
    );
  });
});
