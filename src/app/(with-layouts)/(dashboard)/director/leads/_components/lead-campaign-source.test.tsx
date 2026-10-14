import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeLeadDetail } from "@/services/api/lead-sale/leads";
import LeadCampaignSource from "./lead-campaign-source";

const state = vi.hoisted(() => ({
  allowed: true,
  loading: false,
  error: false,
  channel: "FACEBOOK_LEAD_FORM" as string | null,
  campaignQuery: vi.fn(),
  channelQuery: vi.fn(),
}));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: {}, isLoading: false }),
}));
vi.mock("@/components/common/auth/permissions", () => ({
  getCrmDoctypePermissions: () => ({ canRead: state.allowed }),
}));
vi.mock("@/hooks/use-lead-sale-campaign-queries", () => ({
  useLeadSaleCampaignSourceQuery: (...args: unknown[]) => {
    state.campaignQuery(...args);
    return {
      data: { channelType: state.channel },
      isLoading: state.loading,
      isError: state.error,
    };
  },
  useLeadSaleCampaignChannelTypesQuery: (...args: unknown[]) => {
    state.channelQuery(...args);
    return {
      data: {
        channelTypes: [
          { code: "FACEBOOK_LEAD_FORM", displayName: "Facebook Lead Form" },
        ],
      },
    };
  },
}));

const lead = (campaignId: string | null = "campaign-2") =>
  normalizeLeadDetail({
    lead: {
      id: "lead-1",
      campaignId,
      campaign: campaignId ? "Chiến dịch 2" : null,
      source: "Nguồn cũ độc lập",
      adChannel: "Quảng cáo cũ",
      eventsParticipated: ["Sự kiện khác"],
    },
    log: [],
    meta: {},
  }).lead;

describe("Lead campaign source", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.allowed = true;
    state.loading = false;
    state.error = false;
    state.channel = "FACEBOOK_LEAD_FORM";
  });
  it("shows the linked campaign and its configured channel as read-only fields", () => {
    const html = renderToStaticMarkup(<LeadCampaignSource lead={lead()} />);
    expect(state.campaignQuery).toHaveBeenCalledWith("campaign-2", true);
    expect(state.channelQuery).toHaveBeenCalledWith(
      { enabledOnly: false },
      { enabled: true },
    );
    expect(html).toContain("Chiến dịch tham gia");
    expect(html).toContain("Chiến dịch 2");
    expect(html).toContain("Facebook Lead Form");
    expect(html).not.toMatch(
      /Nguồn cũ độc lập|Quảng cáo cũ|Sự kiện khác|<input|<select/,
    );
  });
  it.each([
    ["missing channel", false, false, null, "Chiến dịch chưa cấu hình kênh"],
    [
      "failed request",
      false,
      true,
      "FACEBOOK_LEAD_FORM",
      "Không tải được kênh chiến dịch",
    ],
    [
      "loading request",
      true,
      false,
      "FACEBOOK_LEAD_FORM",
      "Đang tải kênh chiến dịch…",
    ],
  ])(
    "does not invent a source for %s",
    (_, loading, error, channel, message) => {
      state.loading = loading as boolean;
      state.error = error as boolean;
      state.channel = channel as string | null;
      const html = renderToStaticMarkup(<LeadCampaignSource lead={lead()} />);
      expect(html).toContain(message);
      expect(html).not.toContain("Nguồn cũ độc lập");
    },
  );
  it("does not fetch campaign data or expose cached channels without permission", () => {
    state.allowed = false;
    const html = renderToStaticMarkup(<LeadCampaignSource lead={lead()} />);
    expect(state.campaignQuery).toHaveBeenCalledWith("campaign-2", false);
    expect(state.channelQuery).toHaveBeenCalledWith(
      { enabledOnly: false },
      { enabled: false },
    );
    expect(html).toContain("Chưa có quyền xem kênh chiến dịch");
    expect(html).not.toContain("Facebook Lead Form");
  });
  it("preserves an existing source for a Lead without a campaign and makes no campaign request", () => {
    const html = renderToStaticMarkup(<LeadCampaignSource lead={lead(null)} />);
    expect(state.campaignQuery).toHaveBeenCalledWith("", false);
    expect(html).toContain("Nguồn cũ độc lập");
    expect(html).not.toContain("Facebook Lead Form");
  });
});
