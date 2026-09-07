import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CampaignChannelTypeApiError,
  getCampaignChannelTypes,
  normalizeCampaignChannelTypeList,
} from "./campaign-channel-types";
import { validateChannelUrl } from "../../../app/(with-layouts)/(dashboard)/director/campaigns/_components/channel-types";

afterEach(() => vi.restoreAllMocks());

describe("Lead Sale campaign channel type API contract", () => {
  it("loads and normalizes channel types from the Frappe message envelope", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            total: 1,
            channel_types: [
              {
                code: "EXPERIENCE_DAY",
                display_name: "Experience Day",
                is_online: 0,
                is_offline: 1,
                enabled: 1,
                sort_order: 140,
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );

    const result = await getCampaignChannelTypes(
      { mode: "OFFLINE", search: " Experience Day " },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.campaign_channel_type.list_campaign_channel_types?start=0&page_length=100&mode=OFFLINE&search=Experience+Day",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(result).toEqual({
      total: 1,
      channelTypes: [
        {
          code: "EXPERIENCE_DAY",
          displayName: "Experience Day",
          modes: ["OFFLINE"],
          enabled: true,
          sortOrder: 140,
          description: "",
        },
      ],
    });
  });

  it("normalizes a channel type that supports both modes", () => {
    expect(
      normalizeCampaignChannelTypeList({
        message: {
          total: 1,
          channel_types: [
            {
              code: "REFERRAL",
              display_name: "Giới thiệu",
              modes: ["ONLINE", "OFFLINE"],
              enabled: 1,
              sort_order: 230,
              description: "Canonical campaign channel type: Giới thiệu.",
            },
          ],
        },
      }),
    ).toEqual({
      total: 1,
      channelTypes: [
        {
          code: "REFERRAL",
          displayName: "Giới thiệu",
          modes: ["ONLINE", "OFFLINE"],
          enabled: true,
          sortOrder: 230,
          description: "Canonical campaign channel type: Giới thiệu.",
        },
      ],
    });
  });

  it("exposes the upstream error code", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ error: { code: "FORBIDDEN", message: "Không có quyền." } }),
        { status: 403 },
      ),
    );

    await expect(
      getCampaignChannelTypes({}, { baseUrl: "http://frappe:8000" }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<CampaignChannelTypeApiError>>({
        status: 403,
        code: "FORBIDDEN",
      }),
    );
  });

  it("validates channel URLs before sending campaign mutations", () => {
    expect(validateChannelUrl("https://example.com/open-day")).toBeNull();
    expect(validateChannelUrl("432")).toBe("Channel URL không hợp lệ. Ví dụ: https://example.com/.");
    expect(validateChannelUrl("   ")).toBeNull();
  });
});
