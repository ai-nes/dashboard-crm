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

describe("student ownership with the Nest backend", () => {
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

  it("lists assignable owners and keeps the team id for the assignment", async () => {
    fetchMock.mockImplementation(() =>
      json({
        owners: [
          {
            name: "user-1",
            label: "Nguyễn A",
            profile: "sales",
            role: "sales",
            function: "Sales",
            team: "Tư vấn HCM",
            teamId: "team-1",
            campus: "HCM",
          },
        ],
      }),
    );
    const { getAssignableSales } = await import("../student-ownership");
    const result = await getAssignableSales("student-1");
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "http://api.test/api/v1/students/student-1/ownership-targets",
    );
    expect(result.sales[0]).toMatchObject({
      name: "user-1",
      team: "Tư vấn HCM",
      teamId: "team-1",
    });
  });

  it("assigns through the ownership endpoint with the revision and key", async () => {
    fetchMock.mockImplementation(() =>
      json(
        {
          data: {
            id: "event-1",
            eventType: "owner_assigned",
            aggregateRevision: 3,
            nextOwnerUserId: "user-1",
          },
        },
        201,
      ),
    );
    const { assignStudentToSales } = await import("../student-ownership");
    const result = await assignStudentToSales({
      studentId: "student-1",
      ownerId: "user-1",
      reason: "Phân công",
      expectedRevision: 2,
      idempotencyKey: "key-1",
      correlationId: "corr-1",
      targetTeamId: "team-1",
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://api.test/api/v1/students/student-1/ownership");
    expect(JSON.parse(String(init.body))).toEqual({
      target: { kind: "owner", userId: "user-1", teamId: "team-1" },
      expectedRevision: 2,
      reason: "Phân công",
      idempotencyKey: "key-1",
    });
    expect(result).toMatchObject({ ownership_revision: 3, owner: "user-1" });
  });

  it("surfaces a revision conflict as an ownership error", async () => {
    fetchMock.mockImplementation(() =>
      json(
        { error: { code: "REVISION_CONFLICT", message: "Đã thay đổi." } },
        409,
      ),
    );
    const { assignStudentToSales, StudentOwnershipApiError } =
      await import("../student-ownership");
    await expect(
      assignStudentToSales({
        studentId: "student-1",
        ownerId: "user-1",
        reason: "x",
        expectedRevision: 0,
        idempotencyKey: "k",
        correlationId: "c",
        targetTeamId: "t",
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: "REVISION_CONFLICT",
      name: new StudentOwnershipApiError(0, "", "").name,
    });
  });
});
