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

const item = {
  studentId: "s1",
  name: "Học sinh A",
  school: "THPT A",
  region: "TP.HCM",
  interest: "CNTT",
  source: "Facebook",
  receivedAt: "2026-10-01T00:00:00.000Z",
  status: "no_match",
  owner: null,
  matchScore: null,
  method: "automatic",
  reason: "Không có Sale đạt ngưỡng phù hợp tối thiểu.",
  revision: 0,
  executionId: null,
};
const step = (id: string, order: number) => ({
  id,
  order,
  title: id,
  description: "d",
  detail: "x",
  rules: ["r"],
  status: "success",
  metrics: {
    processedCount: 1,
    successCount: 1,
    warningCount: 0,
    errorCount: 0,
  },
});
const summary = {
  received: 1,
  assigned: 0,
  pending: 1,
  byStatus: { assigned: 0, no_match: 1, missing_data: 0, error: 0 },
};
const healthBlock = {
  automationEnabled: true,
  automationRate: 0,
  successRate: 0,
  reviewCount: 1,
  errorCount: 0,
  averageProcessingMs: null,
  policyVersion: "student-assignment-r1",
};
const workflow = {
  mode: "live",
  version: "student-assignment-r1",
  steps: [
    "input",
    "validation",
    "classification",
    "matching",
    "review",
    "assignment",
  ].map((id, index) => step(id, index + 1)),
  connections: [{ source: "input", target: "validation", label: null }],
};
const meta = {
  viewer: { id: "u1", displayName: "Lead" },
  team: { id: "t1", name: "Team" },
  admissionYear: 2026,
  date: "2026-10-07",
  asOf: "2026-10-07T05:00:00.000Z",
  timezone: "Asia/Ho_Chi_Minh",
  status: "available",
  warnings: [],
};

describe("student assignment with the Nest backend", () => {
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

  it("reads the workspace and the detail through /api/v1", async () => {
    fetchMock.mockImplementation(() =>
      json({
        meta,
        summary,
        health: healthBlock,
        workflow,
        items: [item],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
        },
      }),
    );
    const api = await import("../lead-sale/student-assignment");
    const workspace = await api.getStudentAssignmentWorkspace({
      admissionYear: 2026,
      filter: "review",
      q: "a",
    });
    expect(workspace.items[0]).toMatchObject({
      studentId: "s1",
      status: "no_match",
    });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/student-assignment/workspace?admissionYear=2026&filter=review&q=a&page=1&pageSize=20&sort=receivedAt&order=desc",
    );

    fetchMock.mockImplementation(() =>
      json({
        item,
        issue: { code: "NO_MATCH", message: "m", missingFields: [] },
        candidates: [],
        explainability: {
          policyVersion: "student-assignment-r1",
          matchScore: null,
          reasons: ["x"],
          criteria: [],
        },
        events: [],
        permissions: { canResolve: true, canReassign: false },
      }),
    );
    const detail = await api.getStudentAssignmentDetail("s1", 2026);
    expect(detail.permissions.canResolve).toBe(true);
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      "http://api.test/api/v1/student-assignment/detail?studentId=s1&admissionYear=2026",
    );
  });

  it("sends resolve with the idempotency header and keeps conflict codes", async () => {
    fetchMock.mockImplementation(() =>
      json({
        studentId: "s1",
        command: "resolve",
        assignment: {
          owner: { id: "st1", displayName: "Sale" },
          status: "assigned",
          method: "manual",
          reason: "Phân công thủ công",
          appliedAt: "2026-10-07T05:00:00.000Z",
        },
        revision: 1,
        audit: {
          eventId: "e1",
          actorId: "u1",
          occurredAt: "2026-10-07T05:00:00.000Z",
        },
      }),
    );
    const api = await import("../lead-sale/student-assignment");
    const result = await api.resolveStudentAssignment({
      studentId: "s1",
      ownerId: "st1",
      region: "",
      reason: "Phân công thủ công",
      expectedRevision: 0,
      idempotencyKey: "resolve-key-1",
    });
    expect(result.revision).toBe(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["Idempotency-Key"]).toBe(
      "resolve-key-1",
    );

    fetchMock.mockImplementation(() =>
      json({ error: { code: "STALE_REVISION", message: "Tải lại." } }, 409),
    );
    await expect(
      api.resolveStudentAssignment({
        studentId: "s1",
        ownerId: "st1",
        region: "",
        reason: "Phân công thủ công",
        expectedRevision: 0,
        idempotencyKey: "resolve-key-2",
      }),
    ).rejects.toMatchObject({ status: 409, code: "STALE_REVISION" });
  });

  it("runs the pipeline", async () => {
    fetchMock.mockImplementation(() =>
      json({
        meta,
        summary,
        health: healthBlock,
        workflow,
        run: {
          id: "assignment-pipeline-1",
          status: "completed",
          startedAt: "2026-10-07T05:00:00.000Z",
          completedAt: "2026-10-07T05:00:01.000Z",
          checked: 1,
          assigned: 1,
          deferred: 0,
          failed: 0,
          skipped: 0,
        },
        results: [
          {
            student: "s1",
            request: null,
            status: "applied",
            tier: null,
            queue: "pool-1",
            ownerStaff: "st1",
            reason: null,
            errorCode: null,
          },
        ],
      }),
    );
    const api = await import("../lead-sale/student-assignment");
    const result = await api.runStudentAssignmentPipeline({ limit: 10 });
    expect(result.run.assigned).toBe(1);
    expect(result.results[0]).toMatchObject({
      status: "applied",
      ownerStaff: "st1",
    });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/student-assignment/pipeline",
    );
  });
});
