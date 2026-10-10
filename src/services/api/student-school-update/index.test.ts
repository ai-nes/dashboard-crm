import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createSchool,
  createStudent,
  createStudentWithLead,
  deleteSchool,
  deleteStudent,
  getFieldOptions,
  getLeadOptions,
  getSchools,
  getStudent,
  getStudentHighSchoolScore,
  requestStudentStageTransition,
  StudentSchoolUpdateApiError,
  updateSchool,
  updateStudent,
  updateStudentHighSchoolScore,
} from ".";

const API = "http://localhost:3001";
const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

/** Answers each request from a `"METHOD /path"` table and records the calls. */
function mockRoutes(routes: Record<string, (body: unknown) => Response>) {
  fetchMock.mockImplementation(async (input: string, init?: RequestInit) => {
    const url = new URL(input);
    const key = `${init?.method ?? "GET"} ${url.pathname}`;
    const route = routes[key];
    if (!route) throw new Error(`Unexpected request ${key}`);
    return route(init?.body ? JSON.parse(String(init.body)) : undefined);
  });
}

const sentBody = (index: number) =>
  JSON.parse(String(fetchMock.mock.calls[index]![1].body));

const studentDto = (overrides: Record<string, unknown> = {}) => ({
  id: "STU-1",
  revision: 4,
  fullName: "Nguyễn Minh An",
  phone: "0900000000",
  currentGrade: "10",
  studyStage: "grade_10",
  ...overrides,
});

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("student and school update contract", () => {
  it("requests a student stage transition", async () => {
    mockRoutes({
      "POST /api/v1/students/STU-1/stage": () => json({ data: {} }),
    });

    await requestStudentStageTransition({
      student: "STU-1",
      target_stage: "Qualified",
    });

    expect(sentBody(0)).toEqual({ stage: "Qualified" });
  });

  it("rejects a stage transition without a student", async () => {
    await expect(
      requestStudentStageTransition({
        student: " ",
        target_stage: "Qualified",
      }),
    ).rejects.toMatchObject({ status: 400, code: "INVALID_STUDENT" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reads a student profile as record fields", async () => {
    mockRoutes({
      "GET /api/v1/students/STU-1": () => json({ data: studentDto() }),
    });

    await expect(getStudent("STU-1")).resolves.toMatchObject({
      doctype: "CRM Student",
      name: "STU-1",
      fields: { student_name: "Nguyễn Minh An", phone: "0900000000" },
    });
  });

  it("requires a name before reading a student", async () => {
    await expect(getStudent("  ")).rejects.toMatchObject({
      status: 400,
      code: "INVALID_NAME",
    });
  });

  it("patches only the requested student fields with the current revision", async () => {
    mockRoutes({
      "GET /api/v1/students/STU-1": () => json({ data: studentDto() }),
      "PATCH /api/v1/students/STU-1": () =>
        json({ data: studentDto({ phone: "0911111111" }) }),
    });

    await expect(
      updateStudent("STU-1", { phone: "0911111111" }),
    ).resolves.toMatchObject({
      name: "STU-1",
      updated_fields: { phone: "0911111111" },
    });

    expect(sentBody(1)).toEqual({ expectedRevision: 4, phone: "0911111111" });
  });

  it("maps a deterministic grade to the matching study stage", async () => {
    mockRoutes({
      "GET /api/v1/students/STU-1": () => json({ data: studentDto() }),
      "PATCH /api/v1/students/STU-1": () => json({ data: studentDto() }),
    });

    await updateStudent("STU-1", { current_grade: "10" });

    expect(sentBody(1)).toEqual({
      expectedRevision: 4,
      currentGrade: "10",
      studyStage: "grade_10",
    });
  });

  it("clears an incompatible study stage when the grade changes", async () => {
    mockRoutes({
      "GET /api/v1/students/STU-1": () => json({ data: studentDto() }),
      "PATCH /api/v1/students/STU-1": () =>
        json({ data: studentDto({ currentGrade: "12" }) }),
    });

    await updateStudent("STU-1", {
      current_grade: "12",
      study_stage: "grade_10",
    });

    expect(sentBody(1)).toEqual({
      expectedRevision: 4,
      currentGrade: "12",
      studyStage: null,
    });
  });

  it("rejects an update without fields before calling the API", async () => {
    await expect(updateStudent("STU-1", {})).rejects.toMatchObject({
      status: 400,
      code: "INVALID_FIELDS",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("surfaces backend validation errors", async () => {
    mockRoutes({
      "GET /api/v1/students/STU-1": () => json({ data: studentDto() }),
      "PATCH /api/v1/students/STU-1": () =>
        json(
          {
            error: { code: "VALIDATION_ERROR", message: "Email không hợp lệ." },
          },
          422,
        ),
    });

    await expect(updateStudent("STU-1", { email: "invalid" })).rejects.toEqual(
      expect.objectContaining<Partial<StudentSchoolUpdateApiError>>({
        status: 422,
        code: "VALIDATION_ERROR",
        message: "Email không hợp lệ.",
      }),
    );
  });

  it("reports a missing API URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "");

    await expect(getStudent("STU-1")).rejects.toMatchObject({ status: 503 });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("student high school score contract", () => {
  const score = {
    doctype: "CRM Student",
    name: "STU-1",
    admission_profile: null,
    admission_year: "2026",
    fields: { graduation_score: 8.6 },
  };

  it("reads the score for an admission year", async () => {
    mockRoutes({
      "GET /api/v1/students/STU-1/high-school-score": () =>
        json({ data: score }),
    });

    await expect(getStudentHighSchoolScore("STU-1", "2026")).resolves.toEqual(
      score,
    );
    expect(new URL(fetchMock.mock.calls[0]![0]).search).toBe(
      "?admission_year=2026",
    );
  });

  it("updates the score with the current revision", async () => {
    mockRoutes({
      "GET /api/v1/students/STU-1": () => json({ data: studentDto() }),
      "PUT /api/v1/students/STU-1/high-school-score": () =>
        json({ data: { ...score, updated_fields: { graduation_score: 9 } } }),
    });

    await expect(
      updateStudentHighSchoolScore("STU-1", { graduation_score: 9 }),
    ).resolves.toMatchObject({ updated_fields: { graduation_score: 9 } });
    expect(sentBody(1)).toEqual({ graduation_score: 9, expectedRevision: 4 });
  });

  it("rejects an empty score update", async () => {
    await expect(
      updateStudentHighSchoolScore("STU-1", {}),
    ).rejects.toMatchObject({ status: 400, code: "INVALID_FIELDS" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports every rejected score field and logs the request id", async () => {
    const messages = [
      ["grade_12_gpa", "Điểm TB lớp 12 phải là số từ 0 đến 10."],
      [
        "transcript_score",
        "Điểm học bạ CRM tính (TB điểm) phải là số từ 0 đến 10.",
      ],
      ["encouragement_score", "Số điểm khuyến khích phải là số từ 0 đến 10."],
      ["priority_score", "Điểm ưu tiên đối tượng phải là số từ 0 đến 10."],
    ];
    const details = messages.map(([field, message]) => ({
      field,
      code: "too_big",
      message,
    }));
    mockRoutes({
      "GET /api/v1/students/STU-1": () => json({ data: studentDto() }),
      "PUT /api/v1/students/STU-1/high-school-score": () =>
        json(
          {
            error: {
              code: "INVALID_INPUT",
              message: "The request is invalid.",
              details,
              requestId: "score-request-1",
            },
          },
          400,
        ),
    });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const error = await updateStudentHighSchoolScore("STU-1", {
        grade_12_gpa: 12,
        transcript_score: 12,
        encouragement_score: 12,
        priority_score: 12,
      }).catch((failure: unknown) => failure);
      expect(error).toBeInstanceOf(StudentSchoolUpdateApiError);
      expect(error).toMatchObject({
        status: 400,
        code: "INVALID_INPUT",
        details,
        requestId: "score-request-1",
      });
      for (const [, message] of messages)
        expect((error as Error).message).toContain(message);
      expect(log).toHaveBeenCalledWith(
        "[student-high-school-score:update]",
        expect.objectContaining({
          status: 400,
          code: "INVALID_INPUT",
          requestId: "score-request-1",
          details,
        }),
      );
    } finally {
      log.mockRestore();
    }
  });
});

describe("school and option lookups", () => {
  it("lists schools with the documented filters", async () => {
    mockRoutes({
      "GET /api/v1/schools": () =>
        json({
          schools: [
            {
              id: "SCHOOL-1",
              schoolCode: "S1",
              schoolName: "THPT Nguyễn Huệ",
              province: "Hà Nội",
              ward: "Ba Đình",
              address: null,
              phone: null,
              email: null,
              schoolTier: null,
            },
          ],
        }),
    });

    const result = await getSchools({ province: "P1", ward: "W1", limit: 20 });

    const url = new URL(fetchMock.mock.calls[0]![0]);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      province: "P1",
      ward: "W1",
      limit: "20",
    });
    expect(result.schools[0]).toMatchObject({
      name: "SCHOOL-1",
      fields: { school_name: "THPT Nguyễn Huệ" },
    });
  });

  it("loads field options with the search term", async () => {
    mockRoutes({
      "GET /api/v1/options/province": () =>
        json({
          fieldtype: "Link",
          options: [{ value: "P1", label: "Hà Nội" }],
        }),
    });

    await expect(
      getFieldOptions({
        doctype: "CRM Student",
        fieldname: "province",
        search: "ha",
      }),
    ).resolves.toMatchObject({
      fieldtype: "Link",
      options: [{ value: "P1", label: "Hà Nội" }],
    });
    expect(
      new URL(fetchMock.mock.calls[0]![0]).searchParams.get("search"),
    ).toBe("ha");
  });

  it("loads lead options and validates their shape", async () => {
    const option = { value: "A", label: "A" };
    mockRoutes({
      "GET /api/v1/directory/lead-options": () =>
        json({
          staff: [{ ...option, user: "u1" }],
          segments: [option],
          events: [],
          advertising_channel: [option],
        }),
    });

    await expect(getLeadOptions(50)).resolves.toMatchObject({
      staff: [{ value: "A", user: "u1" }],
    });
    expect(new URL(fetchMock.mock.calls[0]![0]).searchParams.get("limit")).toBe(
      "50",
    );
  });

  it("rejects malformed lead options with 502", async () => {
    mockRoutes({
      "GET /api/v1/directory/lead-options": () => json({ staff: "nope" }),
    });

    await expect(getLeadOptions()).rejects.toMatchObject({
      status: 502,
      code: "INVALID_LEAD_OPTIONS_RESPONSE",
    });
  });
});

describe("school write contract", () => {
  it("patches a school and keeps numeric coordinates", async () => {
    mockRoutes({
      "PATCH /api/v1/geography-catalog/high-schools/01-001-062": () =>
        json({ id: "01-001-062" }),
    });

    await expect(
      updateSchool("01-001-062", { latitude: 10.123, longitude: 105.456 }),
    ).resolves.toMatchObject({
      name: "01-001-062",
      updated_fields: { latitude: 10.123, longitude: 105.456 },
    });
    expect(sentBody(0)).toEqual({
      data: { latitude: 10.123, longitude: 105.456 },
    });
  });

  it("creates a school", async () => {
    mockRoutes({
      "POST /api/v1/geography-catalog/high-schools": () =>
        json({ id: "SCHOOL-9" }),
    });

    await expect(
      createSchool({
        school_name: "THPT Mới",
        school_code: "S9",
        province: "P1",
        ward: "W1",
      }),
    ).resolves.toMatchObject({
      name: "SCHOOL-9",
      created_fields: { school_name: "THPT Mới" },
    });
  });

  it("deletes a school", async () => {
    mockRoutes({
      "DELETE /api/v1/geography-catalog/high-schools/SCHOOL-9": () =>
        json({ id: "SCHOOL-9" }),
    });

    await expect(deleteSchool("SCHOOL-9")).resolves.toEqual({
      doctype: "CRM High School",
      name: "SCHOOL-9",
      deleted: true,
    });
  });
});

describe("student create and delete contract", () => {
  const created = {
    studentCode: "HS-2026-000001",
    leadCode: "LEAD-1",
    fullName: "Nguyễn Minh An",
    phone: "0900000000",
    email: null,
    studentStage: "New",
    ownerUserId: "user-1",
  };

  it("creates a student from the intake form", async () => {
    mockRoutes({ "POST /api/v1/students": () => json(created) });

    await expect(
      createStudent({ student_name: "Nguyễn Minh An", phone: "0900000000" }),
    ).resolves.toMatchObject({
      name: "HS-2026-000001",
      created_fields: { full_name: "Nguyễn Minh An", phone: "0900000000" },
    });
    expect(sentBody(0)).toEqual({
      studentName: "Nguyễn Minh An",
      phone: "0900000000",
    });
  });

  it("trims and compacts the student-with-lead payload", async () => {
    mockRoutes({ "POST /api/v1/students": () => json(created) });

    await createStudentWithLead({
      student_name: " Nguyễn Minh An ",
      phone: " 0900000000 ",
      province: " P1 ",
      campaign: " CAM-1 ",
      assigned_to: " user-1 ",
      email: "  ",
    });

    expect(sentBody(0)).toEqual({
      studentName: "Nguyễn Minh An",
      phone: "0900000000",
      provinceId: "P1",
      campaignId: "CAM-1",
      assignedToUserId: "user-1",
    });
  });

  it("rejects a create without fields", async () => {
    await expect(
      createStudent({} as Parameters<typeof createStudent>[0]),
    ).rejects.toMatchObject({
      status: 400,
      code: "INVALID_FIELDS",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports a malformed create response with 502", async () => {
    mockRoutes({ "POST /api/v1/students": () => json({}) });

    await expect(
      createStudent({ student_name: "An", phone: "0900000000" }),
    ).rejects.toMatchObject({
      status: 502,
    });
  });

  it("deletes a student", async () => {
    mockRoutes({ "DELETE /api/v1/students/STU-1": () => json({}) });

    await expect(deleteStudent("STU-1")).resolves.toEqual({
      doctype: "CRM Student",
      name: "STU-1",
      deleted: true,
    });
  });

  it("surfaces a delete refusal", async () => {
    mockRoutes({
      "DELETE /api/v1/students/STU-1": () =>
        json({ error: { code: "FORBIDDEN", message: "Không có quyền." } }, 403),
    });

    await expect(deleteStudent("STU-1")).rejects.toEqual(
      expect.objectContaining<Partial<StudentSchoolUpdateApiError>>({
        status: 403,
        code: "FORBIDDEN",
      }),
    );
  });
});
