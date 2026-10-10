import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();
const json = (payload: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(payload), { status }));
const recommendation = {
  id: "card-1",
  student_id: "HS-1",
  action_id: "CALL",
  action: { title: "Gọi để tư vấn hồ sơ" },
  reason: "Cần liên hệ",
  objective: "Hoàn thiện hồ sơ",
  expected_revision: "rev-1",
  permitted_decisions: ["ACCEPT", "ACCEPT_WITH_CHANGES", "REJECT"],
  editable_fields: ["priority", "due_at"],
};

describe("student NBA through Nest", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    vi.stubEnv("NEXT_PUBLIC_FRAPPE_URL", "");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("loads restored card content and decision permissions without a Frappe URL", async () => {
    fetchMock.mockImplementation(() => json({ items: [recommendation] }));
    const { getStudentNbaWorklist } = await import("./index");
    const result = await getStudentNbaWorklist({
      studentId: " HS-1 ",
      pageSize: 80,
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://api.test/api/v1/nba/worklist?page_size=50&student_id=HS-1",
    );
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      credentials: "include",
      cache: "no-store",
    });
    expect(result.items[0]).toMatchObject({
      action: { title: "Gọi để tư vấn hồ sơ" },
      objective: "Hoàn thiện hồ sơ",
      expectedRevision: "rev-1",
      permittedDecisions: ["ACCEPT", "ACCEPT_WITH_CHANGES", "REJECT"],
      editableFields: ["priority", "due_at"],
    });
  });

  it("runs NBA with its idempotency header and reads back normalized recommendations", async () => {
    fetchMock.mockImplementation(() =>
      json({
        evaluation: "run-1",
        status: "completed",
        recommendation_count: 1,
        recommendations: [recommendation],
      }),
    );
    const { runStudentNbaEvaluation } = await import("./index");
    const result = await runStudentNbaEvaluation({
      studentId: "HS-1",
      idempotencyKey: "run-key",
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://api.test/api/v1/nba/evaluations");
    expect(init.headers["Idempotency-Key"]).toBe("run-key");
    expect(JSON.parse(init.body)).toEqual({ student_id: "HS-1" });
    expect(result.recommendations[0].expectedRevision).toBe("rev-1");
  });

  it("preserves queued evaluation state so the UI waits for the analysis instead of claiming an empty result", async () => {
    fetchMock.mockImplementation(() =>
      json(
        {
          evaluation: "analysis:HS-1",
          status: "queued",
          recommendation_count: 0,
          recommendations: [],
        },
        202,
      ),
    );
    const { runStudentNbaEvaluation } = await import("./index");
    await expect(
      runStudentNbaEvaluation({ studentId: "HS-1" }),
    ).resolves.toMatchObject({
      status: "queued",
      recommendations: [],
      recommendationCount: 0,
    });
  });

  it("preserves decision revision, edits and idempotency when creating a task", async () => {
    fetchMock.mockImplementation(() =>
      json({ status: "accepted", recommendation: "card-1", action: "task-1" }),
    );
    const { decideNbaRecommendation } = await import("./index");
    const result = await decideNbaRecommendation({
      name: "card-1",
      expectedRevision: "rev-1",
      operation: "ACCEPT_WITH_CHANGES",
      idempotencyKey: "decision-key",
      delta: { due_at: "2026-10-10T08:00:00Z" },
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://api.test/api/v1/nba/decisions");
    expect(init.headers["Idempotency-Key"]).toBe("decision-key");
    expect(JSON.parse(init.body)).toEqual({
      name: "card-1",
      expected_revision: "rev-1",
      operation: "ACCEPT_WITH_CHANGES",
      idempotency_key: "decision-key",
      delta: { due_at: "2026-10-10T08:00:00Z" },
    });
    expect(result.action).toBe("task-1");
  });

  it.each([
    [403, "FORBIDDEN"],
    [409, "STALE_REVISION"],
  ])(
    "preserves %s errors for existing permission/conflict feedback",
    async (status, code) => {
      fetchMock.mockImplementation(() =>
        json({ error: { code, message: "Đã thay đổi" } }, status),
      );
      const { getStudentNbaWorklist, NbaApiError } = await import("./index");
      const error = await getStudentNbaWorklist({ studentId: "HS-1" }).catch(
        (error: unknown) => error,
      );
      expect(error).toBeInstanceOf(NbaApiError);
      expect(error).toMatchObject({ status, code });
    },
  );
});
