import { afterEach, describe, expect, it, vi } from "vitest";
import { getStudentCampaigns } from "./index";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("Student campaign history API", () => {
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
