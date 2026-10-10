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

const student = {
  id: "s1",
  revision: 3,
  fullName: "Nguyen An",
  phone: "0901234567",
  province: "HCM",
  school: "THPT A",
  fatherName: "Cha",
  studentStage: "New",
};

describe("student profile with the Nest backend", () => {
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

  it("reads a student in the dashboard field names", async () => {
    fetchMock.mockImplementation(() => json({ data: student }));
    const { getStudent } = await import("../student-school-update");
    const record = await getStudent("s1");
    expect(record).toMatchObject({
      doctype: "CRM Student",
      name: "s1",
      fields: {
        student_name: "Nguyen An",
        high_school: "THPT A",
        father_name: "Cha",
        student_stage: "New",
      },
    });
  });

  it("sends contact fields with the current revision", async () => {
    fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
      json({
        data:
          init?.method === "PATCH"
            ? { ...student, fatherName: "Cha moi", bankName: "ACB" }
            : student,
      }),
    );
    const { updateStudent } = await import("../student-school-update");
    const result = await updateStudent("s1", {
      father_name: "Cha moi",
      bank_name: "ACB",
    });
    const patch = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(patch[0]).toBe("http://api.test/api/v1/students/s1");
    expect(JSON.parse(patch[1].body as string)).toEqual({
      expectedRevision: 3,
      fatherName: "Cha moi",
      bankName: "ACB",
    });
    expect(result).toMatchObject({
      name: "s1",
      updated_fields: { father_name: "Cha moi", bank_name: "ACB" },
    });
  });

  it("preserves explicit clears and all missing contact fields", async () => {
    fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
      json({
        data:
          init?.method === "PATCH"
            ? { ...student, ...JSON.parse(init.body as string) }
            : student,
      }),
    );
    const { updateStudent } = await import("../student-school-update");
    const fields = {
      parent_other_phone: "0901234567",
      account_number: "00123",
      account_holder: "Cha",
      father_email: "cha@example.com",
      father_occupation: "Teacher",
      mother_email: "me@example.com",
      mother_occupation: "Doctor",
      date_of_birth: null,
      other_phone: null,
      major: null,
      ward: null,
      study_stage: null,
    };
    const result = await updateStudent("s1", fields);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
      parentOtherPhone: "0901234567",
      accountNumber: "00123",
      accountHolder: "Cha",
      fatherEmail: "cha@example.com",
      fatherOccupation: "Teacher",
      motherEmail: "me@example.com",
      motherOccupation: "Doctor",
      dateOfBirth: null,
      otherPhone: null,
      majorId: null,
      wardId: null,
      studyStage: null,
    });
    expect(result.updated_fields).toMatchObject(fields);
  });

  it("rejects unknown fields instead of reporting success", async () => {
    const { nestUpdateStudent } = await import("./nest-student-profile");
    await expect(
      nestUpdateStudent("s1", { invented_field: "value" }),
    ).rejects.toMatchObject({ code: "UNSUPPORTED_STUDENT_FIELD" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("moves the funnel stage and reports backend errors", async () => {
    fetchMock.mockImplementationOnce(() => json({ data: student }));
    const { requestStudentStageTransition } =
      await import("../student-school-update");
    await requestStudentStageTransition({
      student: "s1",
      target_stage: "Attempting",
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://api.test/api/v1/students/s1/stage");
    expect(JSON.parse(init.body as string)).toEqual({ stage: "Attempting" });

    fetchMock.mockImplementationOnce(() =>
      json({ error: { code: "FORBIDDEN", message: "Không có quyền." } }, 403),
    );
    await expect(
      requestStudentStageTransition({
        student: "s1",
        target_stage: "Qualified",
      }),
    ).rejects.toMatchObject({ status: 403, code: "FORBIDDEN" });
  });
});
