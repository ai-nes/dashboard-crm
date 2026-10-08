import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { nestStudentSchoolHandler } from "./nest-student-school-router";
import { chainHandlers } from "./nest-test-support";

const fetchMock = vi.fn();

function json(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("student form calls routed to Nest", () => {
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

  it("reads the lead options from the directory", async () => {
    fetchMock.mockImplementation(() => json({ staff: [], segments: [] }));
    const nestMethodRequest = chainHandlers(nestStudentSchoolHandler);
    await nestMethodRequest(
      "crm.api.lead_mapping.get_lead_options",
      { limit: "100" },
      undefined,
    );
    expect(String(fetchMock.mock.calls[0]![0])).toBe(
      "http://api.test/api/v1/directory/lead-options?limit=100",
    );
  });

  it("creates a student from the form fields and answers in the dashboard shape", async () => {
    fetchMock.mockImplementation(() =>
      json(
        {
          studentCode: "HS-1",
          leadCode: "LD-1",
          fullName: "An",
          phone: "0900000000",
          email: null,
          studentStage: "New",
          ownerUserId: "u1",
        },
        201,
      ),
    );
    const nestMethodRequest = chainHandlers(nestStudentSchoolHandler);
    const result = await nestMethodRequest(
      "crm.api.student_school.create_student_with_lead",
      {},
      {
        fields: {
          student_name: "An",
          phone: "0900000000",
          province: "p1",
          campaign: "c1",
          assigned_to: "u1",
          branch: "",
          description: "ghi chú",
        },
      },
    );
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe("http://api.test/api/v1/students");
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      studentName: "An",
      phone: "0900000000",
      provinceId: "p1",
      campaignId: "c1",
      assignedToUserId: "u1",
      notes: "ghi chú",
    });
    expect(result).toMatchObject({
      name: "HS-1",
      created_fields: { full_name: "An", student_stage: "New" },
    });
  });

  it("deletes a student and a school", async () => {
    fetchMock.mockImplementation(() => json({ deleted: "x" }));
    const nestMethodRequest = chainHandlers(nestStudentSchoolHandler);
    const student = await nestMethodRequest(
      "crm.api.student_school.delete_student",
      {},
      { name: "HS-1" },
    );
    const school = await nestMethodRequest(
      "crm.api.student_school.delete_school",
      {},
      { name: "s1" },
    );
    expect(student).toMatchObject({ name: "HS-1", deleted: true });
    expect(school).toMatchObject({ name: "s1", deleted: true });
    expect(fetchMock.mock.calls.map((call) => String(call[0]))).toEqual([
      "http://api.test/api/v1/students/HS-1",
      "http://api.test/api/v1/geography-catalog/high-schools/s1",
    ]);
  });
});
