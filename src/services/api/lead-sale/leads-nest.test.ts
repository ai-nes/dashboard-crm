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

  it("accepts comma separated segments and persists source", async () => {
    const { toNestLeadBody } = await import("./leads-nest");
    expect(toNestLeadBody({ segments: "x, y", source: "Facebook" })).toEqual({
      segments: ["x", "y"],
      sourceId: "Facebook",
    });
  });

  it("preserves explicit clears on update and leaves omitted fields untouched", async () => {
    const { toNestLeadBody } = await import("./leads-nest");
    expect(
      toNestLeadBody(
        {
          email: null,
          province: "",
          source: null,
          segments: null,
          notes: "  ",
        },
        "update",
      ),
    ).toEqual({
      email: null,
      provinceId: null,
      sourceId: null,
      segments: [],
      notes: null,
    });
  });

  it("rejects fields and potential values it cannot persist", async () => {
    const { toNestLeadBody } = await import("./leads-nest");
    expect(() => toNestLeadBody({ unknown: "value" }, "update")).toThrow();
    expect(() =>
      toNestLeadBody({ conversion_potential: "invalid" }, "update"),
    ).toThrow();
    expect(() => toNestLeadBody({ notes: undefined }, "update")).toThrow();
  });

  it("rejects malformed segment arrays rather than silently dropping values", async () => {
    const { toNestLeadBody } = await import("./leads-nest");
    expect(() => toNestLeadBody({ segments: '["A", 12]' }, "update")).toThrow();
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
