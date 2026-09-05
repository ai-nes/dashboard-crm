import { afterEach, describe, expect, it, vi } from "vitest";

import {
  assignStudentToSales,
  getAssignableSales,
  StudentOwnershipApiError,
} from "./index";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("student ownership API contract", () => {
  it("loads eligible Sale and CTV Sale candidates for a student", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            studentId: "STUDENT-1",
            sales: [
              {
                name: "STAFF-CTV",
                label: "CTV Sale A",
                profile: "ctv_sale",
                role: "CTV Sale",
                function: "CTV-Sale",
                team: "TEAM-1",
                campus: "CAMPUS-1",
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );

    const result = await getAssignableSales("STUDENT-1", "ctv", {
      baseUrl: "http://frappe:8000",
    });

    expect(result.sales[0]?.name).toBe("STAFF-CTV");
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.student_ownership.get_assignable_sales?studentId=STUDENT-1&search=ctv",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("posts an owner assignment with the command metadata", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: { status: "applied", studentId: "STUDENT-1" },
        }),
        { status: 200 },
      ),
    );

    await assignStudentToSales(
      {
        studentId: "STUDENT-1",
        ownerId: "STAFF-CTV",
        reason: "Phân công thủ công cho CTV Sale",
        expectedRevision: 4,
        idempotencyKey: "assign-student-001",
        correlationId: "manual-assign-001",
      },
      { baseUrl: "http://frappe:8000" },
    );

    const [url, init] = fetchSpy.mock.calls[0] ?? [];
    expect(url).toBe(
      "http://frappe:8000/api/method/crm.api.student_ownership.assign_student_to_sales",
    );
    expect(init).toEqual(
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "Idempotency-Key": "assign-student-001",
        }),
      }),
    );
    expect(JSON.parse(String(init?.body))).toEqual({
      studentId: "STUDENT-1",
      ownerId: "STAFF-CTV",
      reason: "Phân công thủ công cho CTV Sale",
      expectedRevision: 4,
      idempotencyKey: "assign-student-001",
      correlationId: "manual-assign-001",
    });
  });

  it("rejects an invalid candidate response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: { studentId: "STUDENT-1" } }), {
        status: 200,
      }),
    );

    await expect(
      getAssignableSales("STUDENT-1", "", { baseUrl: "http://frappe:8000" }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<StudentOwnershipApiError>>({
        status: 502,
        code: "INVALID_ASSIGNABLE_SALES_RESPONSE",
      }),
    );
  });
});
