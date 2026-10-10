import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getStudentScoreContext, StudentScoreContextApiError } from "./index";

const API = "http://localhost:3001";
const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("student score context API contract", () => {
  it("normalizes the latest component scores and template weights", async () => {
    fetchMock.mockResolvedValue(
      json({
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
      }),
    );

    const result = await getStudentScoreContext("CRM-STUDENT-1");

    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/students/CRM-STUDENT-1/score-context?limit=1`,
    );
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({
      method: "GET",
      credentials: "include",
    });
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
    await expect(getStudentScoreContext("")).rejects.toEqual(
      expect.objectContaining<Partial<StudentScoreContextApiError>>({
        status: 417,
        code: "INVALID_STUDENT",
      }),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a response without a history list", async () => {
    fetchMock.mockResolvedValue(json({ student: "CRM-STUDENT-1" }));

    await expect(getStudentScoreContext("CRM-STUDENT-1")).rejects.toEqual(
      expect.objectContaining<Partial<StudentScoreContextApiError>>({
        status: 502,
        code: "INVALID_SCORE_CONTEXT_RESPONSE",
      }),
    );
  });

  it("maps an upstream error to a score context error", async () => {
    fetchMock.mockResolvedValue(
      json({ error: { code: "FORBIDDEN", message: "Không có quyền." } }, 403),
    );

    await expect(getStudentScoreContext("CRM-STUDENT-1")).rejects.toEqual(
      expect.objectContaining<Partial<StudentScoreContextApiError>>({
        status: 403,
        code: "FORBIDDEN",
      }),
    );
  });
});
