import { describe, expect, it } from "vitest";
import type { CampaignRecord } from "@/services/api/campaign-intelligence";
import { buildLeadOverview, leadStatusCount } from "./lead-overview-model";

const campaign = (id: string, leadCount: number, converted: number): CampaignRecord => ({
  id,
  name: id,
  channel: "Facebook",
  leadCount,
  statusBreakdown: [
    { code: "new", label: "Mới", count: leadCount - converted, share: 50 },
    { code: "in_progress", label: "Đang xử lý", count: 0, share: 0 },
    { code: "no_response", label: "Chưa kết nối", count: 0, share: 0 },
    { code: "disqualified", label: "Không phù hợp", count: 0, share: 0 },
    { code: "converted", label: "Đã chuyển đổi", count: converted, share: 50 },
  ],
  qualityCount: 0,
  spend: 0,
  qualifiedLeads: 0,
  applications: 0,
  enrollments: 0,
  confirmedRevenue: 0,
  pipelineRevenue: 0,
  roas: 0,
  cpql: 0,
  enrollmentRate: 0,
  attributionConfidence: "high",
  health: "on_track",
});

describe("lead overview model", () => {
  it("ranks campaigns by total leads and aggregates canonical groups", () => {
    const result = buildLeadOverview([campaign("small", 2, 1), campaign("large", 5, 2)], 1);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.id).toBe("large");
    expect(result.total).toBe(7);
    expect(result.groups.converted).toBe(3);
    expect(leadStatusCount(campaign("large", 5, 2), "converted")).toBe(2);
  });

  it("marks legacy responses without lead aggregates as unavailable", () => {
    const legacy = { ...campaign("legacy", 1, 0), leadCount: null, statusBreakdown: null };

    expect(buildLeadOverview([legacy], 5).available).toBe(false);
  });
});
