import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

describe("student high-school score Nest transport", () => {
  let api: typeof import(".");

  beforeAll(async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    api = await import(".");
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("reads and updates score fields through the Nest REST contract", async () => {
    const score = {
      doctype: "CRM Student" as const,
      name: "HS-2026-HCM-000001",
      admission_profile: null,
      admission_year: "2026",
      fields: {
        graduation_score: 8.6,
        transcript_score: 8.5,
        total_score: 27.25,
        is_high_school_graduate: null,
        graduation_year: null,
        academic_rank: null,
        priority_group: null,
        graduation_classification: null,
        conduct_rank: null,
        grade_12_gpa: null,
        exam_candidate_number: null,
        score_details: null,
        encouragement_type: null,
        encouragement_score: null,
        priority_type: null,
        priority_score: null,
      },
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(
      async (input, init) => {
        const url = String(input);
        if (url.includes("/high-school-score") && init?.method === "PUT") {
          return new Response(
            JSON.stringify({
              data: {
                ...score,
                updated_fields: {
                  graduation_score: 8.6,
                  transcript_score: 8.5,
                  total_score: 27.25,
                },
              },
            }),
            { status: 200 },
          );
        }
        if (url.endsWith("/students/HS-2026-HCM-000001")) {
          return new Response(JSON.stringify({ data: { revision: 4 } }), {
            status: 200,
          });
        }
        return new Response(JSON.stringify({ data: score }), { status: 200 });
      },
    );

    await expect(
      api.getStudentHighSchoolScore("HS-2026-HCM-000001", "2026"),
    ).resolves.toEqual(score);
    await expect(
      api.updateStudentHighSchoolScore(
        "HS-2026-HCM-000001",
        { graduation_score: 8.6, transcript_score: 8.5, total_score: 27.25 },
        "2026",
      ),
    ).resolves.toMatchObject({ updated_fields: { total_score: 27.25 } });

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://api.test/api/v1/students/HS-2026-HCM-000001/high-school-score?admission_year=2026",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://api.test/api/v1/students/HS-2026-HCM-000001/high-school-score",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          graduation_score: 8.6,
          transcript_score: 8.5,
          total_score: 27.25,
          expectedRevision: 4,
        }),
      }),
    );
  });
});
