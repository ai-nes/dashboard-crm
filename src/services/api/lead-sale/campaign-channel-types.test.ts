import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CampaignChannelTypeApiError,
  getCampaignChannelTypes,
  normalizeCampaignChannelTypeList,
} from "./campaign-channel-types";
import { validateChannelUrl } from "../../../app/(with-layouts)/(dashboard)/director/campaigns/_components/channel-types";

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

describe("Lead Sale campaign channel type API contract", () => {
  it("loads and normalizes channel types from the Nest list", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          total: 1,
          channelTypes: [
            {
              code: "EXPERIENCE_DAY",
              displayName: "Experience Day",
              isOnline: false,
              isOffline: true,
              enabled: true,
              sortOrder: 140,
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const result = await getCampaignChannelTypes({
      mode: "OFFLINE",
      search: " Experience Day ",
    });

    expect(fetchMock.mock.calls[0]![0]).toBe(
      "http://localhost:3001/api/v1/campaign-channel-types?mode=OFFLINE&search=Experience+Day&pageLength=100",
    );
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({
      method: "GET",
      credentials: "include",
    });
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
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: "FORBIDDEN", message: "Không có quyền." },
        }),
        { status: 403 },
      ),
    );

    await expect(getCampaignChannelTypes({})).rejects.toEqual(
      expect.objectContaining<Partial<CampaignChannelTypeApiError>>({
        status: 403,
        code: "FORBIDDEN",
      }),
    );
  });

  it("validates channel URLs before sending campaign mutations", () => {
    expect(validateChannelUrl("https://example.com/open-day")).toBeNull();
    expect(validateChannelUrl("432")).toBe(
      "Channel URL không hợp lệ. Ví dụ: https://example.com/.",
    );
    expect(validateChannelUrl("   ")).toBeNull();
  });
});
