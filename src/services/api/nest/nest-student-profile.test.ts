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

  it("sends changed fields with the current revision and drops unsupported ones", async () => {
    fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
      json({
        data:
          init?.method === "PATCH"
            ? { ...student, fatherName: "Cha moi" }
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
    });
    expect(result).toMatchObject({
      name: "s1",
      updated_fields: { father_name: "Cha moi" },
    });
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
