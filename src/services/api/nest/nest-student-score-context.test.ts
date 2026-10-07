import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

function json(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("student score context with the Nest backend", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reads the score context from the Nest endpoint", async () => {
    fetchMock.mockImplementation(() =>
      json({
        student: "s1",
        histories: [{ name: "h1", final_score: 25, details: [] }],
        latest: { name: "h1", final_score: 25, details: [] },
        intents: [],
        template: null,
      }),
    );
    const { getStudentScoreContext } = await import("../student-score-context");
    const result = await getStudentScoreContext("s1");
    expect(result.latest?.finalScore).toBe(25);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/students/s1/score-context?limit=1",
    );
  });

  it("maps backend errors", async () => {
    fetchMock.mockImplementationOnce(() =>
      json({ error: { code: "STUDENT_NOT_FOUND", message: "x" } }, 404),
    );
    const { getStudentScoreContext, StudentScoreContextApiError } =
      await import("../student-score-context");
    await expect(getStudentScoreContext("s1")).rejects.toBeInstanceOf(
      StudentScoreContextApiError,
    );
  });
});
