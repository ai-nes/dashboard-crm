import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  assignStudentToSales,
  getAssignableSales,
  StudentOwnershipApiError,
} from "./index";

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

describe("student ownership API contract", () => {
  it("loads eligible Sale and CTV Sale candidates for a student", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          owners: [
            {
              name: "STAFF-CTV",
              label: "CTV Sale A",
              team: "TEAM-1",
              campus: "CAMPUS-1",
            },
            {
              name: "STAFF-SALE",
              label: "Sale B",
              team: "TEAM-2",
              campus: "CAMPUS-1",
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const result = await getAssignableSales("STUDENT-1", "ctv");

    expect(result.sales.map((sale) => sale.name)).toEqual(["STAFF-CTV"]);
    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/students/STUDENT-1/ownership-targets`,
    );
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({
      method: "GET",
      credentials: "include",
    });
  });

  it("posts an owner assignment with the command metadata", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: "EVENT-1",
            eventType: "ownership_changed",
            aggregateRevision: 5,
            nextOwnerUserId: "STAFF-CTV",
          },
        }),
        { status: 200 },
      ),
    );

    const result = await assignStudentToSales({
      studentId: "STUDENT-1",
      ownerId: "STAFF-CTV",
      reason: "Phân công thủ công cho CTV Sale",
      expectedRevision: 4,
      idempotencyKey: "assign-student-001",
      correlationId: "manual-assign-001",
      targetTeamId: "TEAM-1",
    });

    expect(result).toMatchObject({
      student: "STUDENT-1",
      owner: "STAFF-CTV",
      ownership_revision: 5,
    });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/students/STUDENT-1/ownership`);
    expect(init).toMatchObject({ method: "POST" });
    expect(JSON.parse(String(init.body))).toEqual({
      target: { kind: "owner", userId: "STAFF-CTV", teamId: "TEAM-1" },
      expectedRevision: 4,
      reason: "Phân công thủ công cho CTV Sale",
      idempotencyKey: "assign-student-001",
    });
  });

  it("rejects an invalid candidate response", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ owners: [{ name: "", label: "" }] }), {
        status: 200,
      }),
    );

    await expect(getAssignableSales("STUDENT-1")).rejects.toEqual(
      expect.objectContaining<Partial<StudentOwnershipApiError>>({
        status: 502,
        code: "INVALID_ASSIGNABLE_SALES_RESPONSE",
      }),
    );
  });

  it("maps an upstream error to a student ownership error", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: "REVISION_CONFLICT", message: "Hồ sơ đã thay đổi." },
        }),
        { status: 409 },
      ),
    );

    await expect(getAssignableSales("STUDENT-1")).rejects.toEqual(
      expect.objectContaining<Partial<StudentOwnershipApiError>>({
        status: 409,
        code: "REVISION_CONFLICT",
      }),
    );
  });

  it("requires the revision and target team for an owner command", async () => {
    await expect(
      assignStudentToSales({
        studentId: "STUDENT-1",
        ownerId: "STAFF-CTV",
        reason: "Phân công thủ công",
        expectedRevision: -1,
        idempotencyKey: "assign-student-001",
        correlationId: "manual-assign-001",
        targetTeamId: "",
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<StudentOwnershipApiError>>({
        status: 400,
        code: "INVALID_PAYLOAD",
      }),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
