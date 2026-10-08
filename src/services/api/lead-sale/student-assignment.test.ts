import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  StudentAssignmentApiError,
  getStudentAssignmentDetail,
  getStudentAssignmentWorkspace,
  normalizeRunStudentAssignmentPipeline,
  normalizeStudentAssignmentWorkspace,
  runStudentAssignmentPipeline,
  resolveStudentAssignment,
} from "./student-assignment";

const API = "http://localhost:3001";
const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

function workspaceFixture() {
  const ids = [
    "input",
    "validation",
    "classification",
    "matching",
    "review",
    "assignment",
  ];
  return {
    meta: {
      viewer: { id: "lead@example.com", displayName: "Lead Sale" },
      team: { id: "TEAM-1", name: "Đội Sale" },
      admissionYear: 2026,
      date: "2026-09-05",
      asOf: "2026-09-05T09:15:00+07:00",
      timezone: "Asia/Ho_Chi_Minh",
      status: "available",
      warnings: [],
    },
    summary: {
      received: 2,
      assigned: 1,
      pending: 1,
      byStatus: { assigned: 1, no_match: 1, missing_data: 0, error: 0 },
    },
    health: {
      automationEnabled: true,
      automationRate: 50,
      successRate: 50,
      reviewCount: 1,
      errorCount: 0,
      averageProcessingMs: 1800,
      policyVersion: "student-assignment-r1",
    },
    workflow: {
      mode: "live",
      version: "student-assignment-r1",
      steps: ids.map((id, index) => ({
        id,
        order: index + 1,
        title: id,
        description: "description",
        detail: "detail",
        rules: ["rule"],
        status: index === 4 ? "warning" : "success",
        metrics: {
          processedCount: 2,
          successCount: index === 4 ? 0 : 1,
          warningCount: index === 4 ? 1 : 0,
          errorCount: 0,
        },
      })),
      connections: [],
    },
    items: [
      {
        studentId: "HS-001",
        name: "Nguyễn Minh An",
        school: "THPT Châu Văn Liêm",
        region: "Cần Thơ",
        interest: "Công nghệ thông tin",
        source: "Website tuyển sinh",
        receivedAt: "2026-09-05T09:10:00+07:00",
        status: "assigned",
        owner: { id: "STAFF-1", displayName: "Nguyễn Minh Anh" },
        matchScore: 92,
        method: "automatic",
        reason: null,
        revision: 3,
        executionId: "ASSIGN-1",
      },
      {
        studentId: "HS-002",
        name: "Phạm Minh Khang",
        school: "THPT Trần Đại Nghĩa",
        region: "Vĩnh Long",
        interest: "Công nghệ thông tin",
        source: "Website tuyển sinh",
        receivedAt: "2026-09-05T09:05:00+07:00",
        status: "no_match",
        owner: null,
        matchScore: null,
        method: "automatic",
        reason: "Không có người phù hợp.",
        revision: 1,
        executionId: "ASSIGN-2",
      },
    ],
    pagination: {
      page: 1,
      pageSize: 20,
      total: 2,
      totalPages: 1,
      hasNextPage: false,
    },
  };
}

describe("Student assignment API contract", () => {
  it("serializes the full workspace query and validates six workflow steps", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(workspaceFixture()), { status: 200 }),
    );

    const result = await getStudentAssignmentWorkspace({
      admissionYear: 2026,
      date: "2026-09-05",
      timezone: "Asia/Ho_Chi_Minh",
      filter: "review",
      q: "khang",
      page: 2,
      pageSize: 20,
      sort: "receivedAt",
      order: "desc",
    });

    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/student-assignment/workspace?admissionYear=2026&date=2026-09-05&timezone=Asia%2FHo_Chi_Minh&filter=review&q=khang&page=2&pageSize=20&sort=receivedAt&order=desc`,
    );
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({
      method: "GET",
      credentials: "include",
    });
    expect(result.workflow.steps).toHaveLength(6);
    expect(result.summary.pending).toBe(1);
  });

  it("runs the backend assignment pipeline and normalizes its report", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          ...workspaceFixture(),
          run: {
            id: "assignment-pipeline-1",
            status: "completed",
            startedAt: "2026-09-05T09:15:00+07:00",
            completedAt: "2026-09-05T09:15:02+07:00",
            checked: 2,
            assigned: 1,
            deferred: 1,
            failed: 0,
            skipped: 0,
          },
          results: [
            {
              student: "HS-001",
              request: "ROUTE-1",
              status: "applied",
              tier: "tier_1",
              queue: null,
              ownerStaff: "STAFF-1",
              reason: null,
              errorCode: null,
            },
            {
              student: "HS-002",
              request: "ROUTE-2",
              status: "superseded",
              tier: null,
              queue: null,
              ownerStaff: null,
              reason: "STALE_OWNERSHIP_REVISION",
              errorCode: null,
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const result = await runStudentAssignmentPipeline({
      admissionYear: 2026,
      timezone: "Asia/Ho_Chi_Minh",
      limit: 25,
    });

    expect(result.run.id).toBe("assignment-pipeline-1");
    expect(result.results[0]?.status).toBe("applied");
    expect(result.results[1]?.status).toBe("superseded");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/student-assignment/pipeline`);
    expect(init).toMatchObject({ method: "POST" });
    expect(JSON.parse(init.body)).toEqual({
      admissionYear: 2026,
      timezone: "Asia/Ho_Chi_Minh",
      limit: 25,
    });
  });

  it("normalizes a pipeline report without requiring a workspace snapshot", () => {
    const result = normalizeRunStudentAssignmentPipeline({
      run: {
        id: "assignment-pipeline-2",
        status: "completed",
        startedAt: "2026-09-05T09:15:00+07:00",
        completedAt: "2026-09-05T09:15:02+07:00",
        checked: 1,
        assigned: 0,
        deferred: 1,
        failed: 0,
        skipped: 0,
      },
      results: [
        {
          student: "HS-003",
          request: "ROUTE-3",
          status: "queued",
          tier: 4,
          queue: "DATA_ENRICHMENT_QUEUE",
          ownerStaff: null,
          reason: null,
          errorCode: null,
        },
      ],
    });

    expect(result.run.id).toBe("assignment-pipeline-2");
    expect(result.results[0]?.tier).toBe(4);
  });

  it("rejects invalid summary invariants instead of falling back to fixtures", () => {
    const fixture = workspaceFixture();
    fixture.summary.pending = 0;
    expect(() => normalizeStudentAssignmentWorkspace(fixture)).toThrow(
      "workspace summary counts violate the contract",
    );
  });

  it("sends the idempotency header for resolve", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          studentId: "HS-002",
          command: "resolve",
          assignment: {
            owner: { id: "STAFF-1", displayName: "Nguyễn Minh Anh" },
            status: "assigned",
            method: "manual",
            reason: "Đã thống nhất với nhân sự phụ trách khu vực.",
            appliedAt: "2026-09-05T09:50:00+07:00",
          },
          revision: 2,
          audit: {
            eventId: "AUDIT-1",
            actorId: "lead@example.com",
            occurredAt: "2026-09-05T09:50:00+07:00",
          },
        }),
        { status: 200 },
      ),
    );

    const result = await resolveStudentAssignment({
      studentId: "HS-002",
      ownerId: "STAFF-1",
      region: "Vĩnh Long",
      reason: "Đã thống nhất với nhân sự phụ trách khu vực.",
      expectedRevision: 1,
      idempotencyKey: "assign:HS-002:20260905:01",
    });

    expect(result.revision).toBe(2);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/student-assignment/resolve`);
    expect(init).toMatchObject({
      method: "POST",
      headers: expect.objectContaining({
        "Idempotency-Key": "assign:HS-002:20260905:01",
      }),
    });
    expect(JSON.parse(init.body)).toEqual({
      studentId: "HS-002",
      ownerId: "STAFF-1",
      region: "Vĩnh Long",
      reason: "Đã thống nhất với nhân sự phụ trách khu vực.",
      expectedRevision: 1,
    });
  });

  it("keeps backend error code and status", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ error: { code: "STALE_REVISION", message: "Stale" } }),
        { status: 409 },
      ),
    );
    await expect(
      resolveStudentAssignment({
        studentId: "HS-002",
        ownerId: "STAFF-1",
        region: "Vĩnh Long",
        reason: "Đã thống nhất với nhân sự phụ trách khu vực.",
        expectedRevision: 1,
        idempotencyKey: "assign:HS-002:20260905:01",
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<StudentAssignmentApiError>>({
        status: 409,
        code: "STALE_REVISION",
      }),
    );
  });

  it("requires a valid detail student id", async () => {
    await expect(getStudentAssignmentDetail(" ")).rejects.toEqual(
      expect.objectContaining({ status: 400, code: "INVALID_QUERY" }),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
