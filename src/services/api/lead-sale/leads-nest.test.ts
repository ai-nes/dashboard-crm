import { describe, expect, it, vi } from "vitest";

describe("toNestLeadBody", () => {
  it("maps snake_case field names and drops empty values", async () => {
    const { toNestLeadBody } = await import("./leads-nest");
    expect(
      toNestLeadBody({
        student_name: " Nguyen Van A ",
        phone: "0901234567",
        province: "HCM",
        branch: "",
        email: null,
        conversion_potential: "Trung bình",
        segments: '["a","b"]',
        campaign: "Spring",
      }),
    ).toEqual({
      studentName: "Nguyen Van A",
      phone: "0901234567",
      provinceId: "HCM",
      conversionPotential: "medium",
      segments: ["a", "b"],
      campaignId: "Spring",
    });
  });

  it("accepts comma separated segments and ignores unknown fields", async () => {
    const { toNestLeadBody } = await import("./leads-nest");
    expect(toNestLeadBody({ segments: "x, y", source: "Facebook" })).toEqual({
      segments: ["x", "y"],
    });
  });

  it("creates a lead timeline comment through Nest", async () => {
    vi.resetModules();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { id: "comment-1" } }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    vi.stubGlobal("fetch", fetchMock);
    const { nestCreateLeadComment } = await import("./leads-nest");
    await expect(
      nestCreateLeadComment("lead-1", {
        title: "Trao đổi",
        content: "Đã gọi lại.",
      }),
    ).resolves.toMatchObject({ data: { id: "comment-1" } });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/api/v1/leads/lead-1/comments",
      expect.objectContaining({ method: "POST" }),
    );
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
});
