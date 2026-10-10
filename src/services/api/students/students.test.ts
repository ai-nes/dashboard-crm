import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  computeStudent360,
  DirectorStudentsApiError,
  getDirectorStudents,
  getStudent360,
  getStudentChatwootInteractions,
  getStudentInteractions,
} from "./index";

const API = "http://localhost:3001";
const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const studentRow = {
  id: "stu-1",
  studentCode: "HS-001",
  sourceLeadId: null,
  fullName: "Nguyễn Minh An",
  studentStage: "Qualified",
  qualityBucket: "Hot",
  ownerUserId: "user-1",
  owner: "Sale One",
  province: "Hà Nội",
  provinceId: "PROVINCE-01",
  school: "THPT A",
  major: "CNTT",
  source: "Facebook",
  latestScore: "82",
  revision: 3,
  ownershipRevision: 5,
  modifiedAt: "2026-10-07T10:00:00.000Z",
};

const studentList = (data: unknown[] = [studentRow]) => ({
  data,
  meta: {
    total: data.length,
    page: 1,
    pageSize: 20,
    totalPages: 1,
    hasNextPage: false,
  },
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

describe("director students API contract", () => {
  it("reports a missing API URL instead of showing fixture data", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "");

    await expect(
      getDirectorStudents({ admissionYear: 2026, page: 1, pageSize: 20 }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<DirectorStudentsApiError>>({
        status: 503,
        code: "API_UNAVAILABLE",
      }),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lists students with query parameters and maps the rows", async () => {
    fetchMock.mockResolvedValue(json(studentList()));

    const result = await getDirectorStudents({
      admissionYear: 2026,
      page: 1,
      pageSize: 10,
      q: "nguyen",
      stage: "Qualified",
      order: "asc",
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    const parsed = new URL(url as string);
    expect(parsed.origin + parsed.pathname).toBe(`${API}/api/v1/students`);
    expect(Object.fromEntries(parsed.searchParams)).toEqual({
      admissionYear: "2026",
      page: "1",
      pageSize: "10",
      q: "nguyen",
      stage: "Qualified",
      order: "asc",
    });
    expect(init).toMatchObject({ method: "GET", credentials: "include" });
    expect(result.meta.total).toBe(1);
    expect(result.data[0]).toMatchObject({
      id: "stu-1",
      name: "Nguyễn Minh An",
      code: "HS-001",
      assignmentStatus: "assigned",
      lifecycleStatus: "Applicant",
      revision: 5,
      priority: "Cao",
    });
  });

  it("passes owner, province and campaign filters to the students endpoint", async () => {
    fetchMock.mockResolvedValue(json(studentList([])));

    await getDirectorStudents({
      admissionYear: 2026,
      ownerId: "STAFF-1",
      provinceId: "PROVINCE-01",
      campaign: "CAM-2026-00001",
    });

    const parsed = new URL(fetchMock.mock.calls[0]![0] as string);
    expect(parsed.searchParams.get("ownerId")).toBe("STAFF-1");
    expect(parsed.searchParams.get("provinceId")).toBe("PROVINCE-01");
    expect(parsed.searchParams.get("campaignId")).toBe("CAM-2026-00001");
  });

  it("throws DirectorStudentsApiError on authorization failure", async () => {
    fetchMock.mockResolvedValue(
      json(
        { error: { code: "FORBIDDEN", message: "Không có quyền truy cập." } },
        403,
      ),
    );

    await expect(getDirectorStudents({ admissionYear: 2026 })).rejects.toEqual(
      expect.objectContaining<Partial<DirectorStudentsApiError>>({
        status: 403,
        code: "FORBIDDEN",
      }),
    );
  });
});

describe("student 360 API contract", () => {
  it("maps 404 to null", async () => {
    fetchMock.mockResolvedValue(
      json(
        { error: { code: "STUDENT_NOT_FOUND", message: "Không tìm thấy." } },
        404,
      ),
    );

    await expect(getStudent360("non-existent-student")).resolves.toBeNull();
    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/students/non-existent-student`,
    );
  });

  it("loads a student and maps it to the 360 view", async () => {
    fetchMock.mockResolvedValue(json({ data: studentRow }));

    const result = await getStudent360("stu-1");

    expect(fetchMock.mock.calls[0]![0]).toBe(`${API}/api/v1/students/stu-1`);
    expect(result?.student.name).toBe("Nguyễn Minh An");
  });

  it("rejects a response without a student with 502", async () => {
    fetchMock.mockResolvedValue(json({}));

    await expect(getStudent360("stu-1")).rejects.toEqual(
      expect.objectContaining<Partial<DirectorStudentsApiError>>({
        status: 502,
        code: "INVALID_STUDENT_RESPONSE",
      }),
    );
  });

  it("keeps the offline demo fixture for the mock routes", () => {
    expect(computeStudent360("nguyen-minh-an")?.student.name).toBe(
      "Nguyễn Minh An",
    );
  });
});

describe("student interactions API contract", () => {
  it("reads calls from the student timeline", async () => {
    fetchMock.mockResolvedValue(json({ data: [], meta: { total: 0 } }));

    const result = await getStudentInteractions("ENR-1");

    const parsed = new URL(fetchMock.mock.calls[0]![0] as string);
    expect(parsed.pathname).toBe("/api/v1/students/ENR-1/timeline");
    expect(parsed.searchParams.get("limit")).toBe("100");
    expect(result).toEqual({
      student_id: "ENR-1",
      zalo_messages: [],
      calls: [],
      total_interactions: 0,
    });
  });

  it("rejects a timeline response without a data list", async () => {
    fetchMock.mockResolvedValue(json({ data: "nope" }));

    await expect(getStudentInteractions("ENR-1")).rejects.toEqual(
      expect.objectContaining<Partial<DirectorStudentsApiError>>({
        status: 502,
        code: "INVALID_INTERACTIONS_RESPONSE",
      }),
    );
  });
});

describe("student Chatwoot interactions API contract", () => {
  const entries = Array.from({ length: 11 }, (_, index) => ({
    id: `INTX-${index + 1}`,
    type: "interaction",
    channel: "chatwoot",
    occurredAt: `2026-09-04T12:${String(index).padStart(2, "0")}:00.000Z`,
    title: "Em muốn hỏi học phí.",
    direction: "inbound",
  }));

  it("paginates interaction entries from the timeline", async () => {
    fetchMock.mockResolvedValue(
      json({ data: [...entries, { id: "call-1", type: "call" }] }),
    );

    const result = await getStudentChatwootInteractions("ENR-1", {
      page: 2,
      pageSize: 10,
    });

    const parsed = new URL(fetchMock.mock.calls[0]![0] as string);
    expect(parsed.pathname).toBe("/api/v1/students/ENR-1/timeline");
    expect(result?.meta).toEqual({
      page: 2,
      page_size: 10,
      total: 11,
      has_next_page: false,
    });
    expect(result?.data).toHaveLength(1);
    expect(result?.data[0]).toMatchObject({
      name: "INTX-11",
      channel: "chatwoot",
      direction: "inbound",
    });
  });

  it("rejects an invalid timeline envelope", async () => {
    fetchMock.mockResolvedValue(json({ meta: {} }));

    await expect(getStudentChatwootInteractions("ENR-1")).rejects.toEqual(
      expect.objectContaining<Partial<DirectorStudentsApiError>>({
        status: 502,
        code: "INVALID_CHATWOOT_INTERACTIONS_RESPONSE",
      }),
    );
  });
});
