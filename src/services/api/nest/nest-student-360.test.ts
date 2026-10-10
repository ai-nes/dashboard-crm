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

describe("student 360 with the Nest backend", () => {
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

  it("builds the dashboard projection from the Nest student detail", async () => {
    fetchMock.mockImplementation(() =>
      json({
        data: {
          id: "s1",
          studentCode: "HS-2026-0001",
          fullName: "Nguyen An",
          studentStage: "Qualified",
          qualityBucket: "Hot",
          ownerUserId: "u1",
          owner: "Sale A",
          province: "HCM",
          provinceId: "p1",
          school: "THPT A",
          highSchoolId: "school-1",
          major: "CNTT",
          phone: "0901234567",
          email: "an@example.com",
          source: "Facebook",
          campaign: "Campaign A",
          admissionYear: "2026",
          currentGrade: "12",
          parentName: "Nguyen Minh",
          dateOfBirth: "2008-02-03",
          idNumber: "012345678901",
          fatherEmail: "father@example.com",
          bankName: "ACB",
          majorId: "major-1",
          campusId: "campus-1",
          admissionYearId: "year-1",
          contactAddress: "12 Street",
          admissionProfiles: [
            {
              id: "profile-1",
              application: "application-1",
              admissionMethodCode: "THPT_SCORE",
              requirements: [],
            },
          ],
          revision: 4,
          latestScore: "82",
          createdAt: "2026-10-01T00:00:00.000Z",
          modifiedAt: "2026-10-07T05:00:00.000Z",
        },
      }),
    );

    const { getStudent360 } = await import("../students");
    const result = await getStudent360("s1");
    expect(result?.student.profileDetails).toMatchObject({
      personal: {
        dateOfBirth: "2008-02-03",
        idNumber: "012345678901",
        majorId: "major-1",
        branchId: "campus-1",
        admissionYearId: "year-1",
      },
      contact: {
        name: "Nguyen Minh",
        fatherEmail: "father@example.com",
        bankName: "ACB",
      },
      address: { fullAddress: "12 Street" },
    });
    expect(result?.student.engagementRevision).toBe(4);
    expect(result?.admissionProfiles?.[0]).toMatchObject({
      id: "profile-1",
      application: "application-1",
      admissionMethodCode: "THPT_SCORE",
    });

    expect(result).toMatchObject({
      student: {
        id: "s1",
        name: "Nguyen An",
        code: "HS-2026-0001",
        studentStage: "Qualified",
        priority: "Cao",
        ownerId: "u1",
      },
      classification: { dimensions: [] },
      insight: { signalScore: 82 },
      family: [{ value: "Nguyen Minh" }],
    });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/students/s1",
    );
  });

  it("returns null for an out-of-scope student", async () => {
    fetchMock.mockImplementation(() =>
      json({ error: { code: "STUDENT_NOT_FOUND", message: "Not found" } }, 404),
    );
    const { getStudent360 } = await import("../students");
    await expect(getStudent360("missing")).resolves.toBeNull();
  });
});
