import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addStudentCampaign,
  getStudentCampaignOptions,
  getStudentCampaigns,
} from "./index";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("Student campaign history API", () => {
  it("posts participation for the exact student with session credentials", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ data: { id: "p" } })));
    vi.stubGlobal("fetch", fetch);
    await addStudentCampaign("student/id", "campaign");
    expect(fetch).toHaveBeenCalledWith(
      "http://api.test/api/v1/students/student%2Fid/campaigns",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ campaignId: "campaign" }),
      }),
    );
  });
  it("paginates and searches eligible campaign options", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ data: [], meta: { hasNextPage: false } }),
        ),
      );
    vi.stubGlobal("fetch", fetch);
    await getStudentCampaignOptions("student", "đợt", 2);
    expect(String(fetch.mock.calls[0][0])).toContain(
      "/students/student/campaign-options?",
    );
    expect(String(fetch.mock.calls[0][0])).toContain("page=2");
  });
  it("sends the custom registration timestamp unchanged", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ data: { id: "p" } })));
    vi.stubGlobal("fetch", fetch);
    await addStudentCampaign("student", "campaign", "2026-09-25T02:30:00.000Z");
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      campaignId: "campaign",
      registeredAt: "2026-09-25T02:30:00.000Z",
    });
  });
  it("reads the requested page with session credentials and cancellation", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    const body = {
      data: [],
      meta: { total: 21, page: 2, pageSize: 20, hasNextPage: false },
    };
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(body)));
    vi.stubGlobal("fetch", fetch);
    const signal = new AbortController().signal;
    expect(await getStudentCampaigns("student/id", 2, signal)).toEqual(body);
    expect(fetch).toHaveBeenCalledWith(
      "http://api.test/api/v1/students/student%2Fid/campaigns?page=2&pageSize=20",
      expect.objectContaining({ credentials: "include", signal }),
    );
  });
  it("preserves a forbidden response instead of presenting empty history", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ error: { code: "FORBIDDEN", message: "Denied" } }),
            { status: 403 },
          ),
        ),
    );
    await expect(getStudentCampaigns("student", 1)).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
    });
  });
});
