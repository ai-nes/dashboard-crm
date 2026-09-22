import { afterEach, describe, expect, it, vi } from "vitest";

import { getStudentScoreContext, StudentScoreContextApiError } from "./index";

afterEach(() => vi.restoreAllMocks());

describe("student score context API contract", () => {
  it("normalizes the latest component scores and template weights", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            student: "CRM-STUDENT-1",
            histories: [
              {
                name: "SCH-1",
                student: "CRM-STUDENT-1",
                score_template: "SCT-1",
                fit_score: 40,
                engagement_score: 30,
                intent_score: 30,
                final_score: 82,
                score_change: 13,
                details: [
                  {
                    category: "Fit",
                    rule_id: "RULE-1",
                    signal: "Academic profile",
                    score: 40,
                    reason: "Hồ sơ phù hợp",
                  },
                ],
              },
            ],
            latest: {
              name: "SCH-1",
              student: "CRM-STUDENT-1",
              fit_score: 40,
              engagement_score: 30,
              intent_score: 30,
              final_score: 82,
            },
            intents: [],
            template: {
              name: "SCT-1",
              template_name: "Default",
              status: "Active",
              fit_weight: 0.4,
              engagement_weight: 0.3,
              intent_weight: 0.3,
            },
          },
        }),
        { status: 200 },
      ),
    );

    const result = await getStudentScoreContext("CRM-STUDENT-1", {
      baseUrl: "http://frappe:8000",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.student_dashboard.get_student_score_context?student=CRM-STUDENT-1&limit=1",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(result.latest).toMatchObject({
      fitScore: 40,
      engagementScore: 30,
      intentScore: 30,
      finalScore: 82,
    });
    expect(result.template).toMatchObject({
      fitWeight: 0.4,
      engagementWeight: 0.3,
      intentWeight: 0.3,
    });
    expect(result.histories[0]?.details[0]).toMatchObject({
      category: "Fit",
      ruleId: "RULE-1",
      score: 40,
    });
  });

  it("rejects an empty student id before making a request", async () => {
    await expect(
      getStudentScoreContext("", { baseUrl: "http://frappe:8000" }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<StudentScoreContextApiError>>({
        status: 417,
        code: "INVALID_STUDENT",
      }),
    );
  });
});
