import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  assignLeadToStaff,
  convertLeadToStudent,
  createLead,
  deleteLead,
  getLeadAssignmentTargets,
  getLeadDetail,
  getLeadList,
  LeadApiError,
  normalizeLeadDetail,
  normalizeLeadList,
  previewLeadImport,
  previewNewLeads,
  processLead,
  processNewLeads,
  reopenLead,
  updateLead,
  updateLeadProcessingStatus,
} from "./leads";

const API = "http://localhost:3001";
const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

type Routes = Record<string, () => Response>;

/** Answers `METHOD /path` with the matching route; anything else is a 404. */
function mockRoutes(routes: Routes) {
  fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
    const key = `${init?.method ?? "GET"} ${new URL(url).pathname}`;
    const route = routes[key];
    return route
      ? route()
      : json({ error: { code: "NOT_FOUND", message: key } }, 404);
  });
}

const callKeys = () =>
  fetchMock.mock.calls.map(
    ([url, init]) => `${init?.method ?? "GET"} ${new URL(url).pathname}`,
  );

const bodyOf = (index: number) =>
  JSON.parse(String(fetchMock.mock.calls[index]![1].body));

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

function listFixture() {
  return {
    data: [
      {
        id: "LEAD-2026-00001",
        leadCode: "LD-2026-00001",
        studentCode: null,
        studentId: null,
        initials: "MA",
        name: "Nguyễn Minh An",
        phone: "0900000000",
        school: "THPT Châu Văn Liêm",
        status: "Đang xử lý",
        statusCode: "PROCESSED",
        processingStatus: "PROCESSED",
        result: "MATCHED",
        source: "Website",
        owner: "Chưa phân công",
        ownerStaff: "STAFF-1",
        owningTeam: "TEAM-1",
        ownershipRevision: 2,
        contactNoAnswer: 2,
        contactSuccess: 3,
        createdAt: "2026-09-07T10:00:00+07:00",
      },
    ],
    meta: {
      total: 1,
      totalAll: 8,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasNextPage: false,
      admissionYear: 2026,
      query: "Nguyễn",
      status: null,
      statusOptions: [{ value: "NEW", label: "Mới" }],
      resolution: "MATCHED",
      resolutionOptions: [{ value: "MATCHED", label: "Đã liên kết" }],
      order: "asc",
      stats: { total: 1, inProgress: 1, closed: 0, conversionRate: 0 },
      asOf: "2026-09-07T10:00:00+07:00",
    },
  };
}

const leadRecord = {
  id: "LEAD-2026-00003",
  studentName: "Lê Văn Cường",
  phone: "0922222222",
  email: "cuong@example.com",
  province: "Cần Thơ",
  ward: "Phường An Cư",
  major: "Trí tuệ nhân tạo",
  aspiration: "Nguyện vọng 1",
  notes: "Đăng ký từ landing page.",
  segments: ["Quan tâm học bổng"],
  conversionPotential: "high",
  revision: 4,
  modifiedAt: "2026-09-08T10:00:00+07:00",
};

const timeline = [
  {
    id: "status:1",
    type: "status",
    occurredAt: "2026-09-07T11:00:00+07:00",
    author: "Administrator",
    title: "Cập nhật tình trạng Lead",
    content: "NEW → PROCESSING",
    channel: "processing",
    outcome: null,
  },
];

describe("Lead list/detail API contract", () => {
  it("serializes list filters and normalizes the list envelope", async () => {
    fetchMock.mockResolvedValue(json(listFixture()));

    const result = await getLeadList({
      admissionYear: 2026,
      page: 1,
      pageSize: 10,
      q: "Nguyễn",
      status: "NEW",
      resolution: "MATCHED",
      campaign: "CAM-2026-00001",
      order: "asc",
    });

    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/leads?admissionYear=2026&page=1&pageSize=10&q=Nguy%E1%BB%85n&status=NEW&resolution=MATCHED&campaign=CAM-2026-00001&order=asc`,
    );
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({
      method: "GET",
      credentials: "include",
    });
    expect(result.data[0]).toMatchObject({
      name: "Nguyễn Minh An",
      leadCode: "LD-2026-00001",
      studentCode: null,
      studentId: null,
      status: "Đang xử lý",
      statusCode: "PROCESSED",
      processingStatus: "PROCESSED",
      result: "MATCHED",
      ownerStaff: "STAFF-1",
      owningTeam: "TEAM-1",
      ownershipRevision: 2,
      contactNoAnswer: 2,
      contactSuccess: 3,
      createdAt: "2026-09-07T10:00:00+07:00",
    });
    expect(result.meta.statusOptions).toEqual([{ value: "NEW", label: "Mới" }]);
    expect(result.meta.resolution).toBe("MATCHED");
    expect(result.meta.order).toBe("asc");
    expect(result.meta.resolutionOptions).toEqual([
      { value: "MATCHED", label: "Đã liên kết" },
    ]);
    expect(result.meta.stats).toEqual({
      total: 1,
      inProgress: 1,
      closed: 0,
      conversionRate: 0,
    });
  });

  it("rejects an invalid list envelope with a stable typed error", async () => {
    fetchMock.mockResolvedValue(json({ data: "not-an-array" }));

    await expect(getLeadList()).rejects.toEqual(
      expect.objectContaining<Partial<LeadApiError>>({
        status: 502,
        code: "INVALID_LEAD_RESPONSE",
      }),
    );
  });

  it("exposes the upstream error code and message", async () => {
    fetchMock.mockResolvedValue(
      json({ error: { code: "FORBIDDEN", message: "Không có quyền." } }, 403),
    );

    await expect(getLeadList()).rejects.toEqual(
      expect.objectContaining<Partial<LeadApiError>>({
        status: 403,
        code: "FORBIDDEN",
        message: "Không có quyền.",
      }),
    );
  });

  it("maps a missing Lead detail to null", async () => {
    fetchMock.mockImplementation(async () =>
      json({ error: { code: "NOT_FOUND", message: "Không có Lead." } }, 404),
    );

    await expect(getLeadDetail("LEAD-MISSING")).resolves.toBeNull();
  });

  it("loads the Lead record and its timeline into one projection", async () => {
    mockRoutes({
      "GET /api/v1/leads/LEAD-2026-00003": () => json({ data: leadRecord }),
      "GET /api/v1/leads/LEAD-2026-00003/timeline": () =>
        json({ data: timeline }),
    });

    const result = await getLeadDetail("LEAD-2026-00003");

    expect(callKeys().sort()).toEqual([
      "GET /api/v1/leads/LEAD-2026-00003",
      "GET /api/v1/leads/LEAD-2026-00003/timeline",
    ]);
    expect(result).toMatchObject({
      lead: {
        id: "LEAD-2026-00003",
        name: "Lê Văn Cường",
        email: "cuong@example.com",
        ward: "Phường An Cư",
        interestedMajor: "Trí tuệ nhân tạo",
        conversionPotential: "Cao",
        segments: ["Quan tâm học bổng"],
        description: "Đăng ký từ landing page.",
        modifiedAt: "2026-09-08T10:00:00+07:00",
      },
      log: [
        {
          id: "status:1",
          type: "activity",
          title: "Cập nhật tình trạng Lead",
          author: "Administrator",
        },
      ],
      meta: { asOf: "2026-09-08T10:00:00+07:00" },
    });
  });

  it("loads eligible Sale/CTV targets for a Lead", async () => {
    fetchMock.mockResolvedValue(
      json({
        data: {
          lead: "LEAD-2026-00001",
          province: "Ho Chi Minh City",
          ownership_revision: 2,
          targets: [
            {
              staff: "STAFF-1",
              staffName: "Nguyễn Minh An",
              team: "TEAM-1",
              teamName: "Sale HCM",
              function: "Sale",
              capacity: { active: 3, limit: 10, remaining: 7 },
              effectiveActive: 3,
            },
          ],
        },
      }),
    );

    await expect(
      getLeadAssignmentTargets("LEAD-2026-00001"),
    ).resolves.toMatchObject({
      ownershipRevision: 2,
      targets: [
        expect.objectContaining({
          id: "STAFF-1",
          displayName: "Nguyễn Minh An",
          teamId: "TEAM-1",
          teamName: "Sale HCM",
          effectiveActive: 3,
        }),
      ],
    });
    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/leads/LEAD-2026-00001/assignment-targets`,
    );
  });

  it("assigns a Lead with its ownership revision", async () => {
    fetchMock.mockResolvedValue(
      json({
        data: { ownerUserId: "STAFF-1", owningTeamId: "TEAM-1", revision: 3 },
      }),
    );

    await expect(
      assignLeadToStaff({
        lead: "LEAD-2026-00001",
        ownerStaff: "STAFF-1",
        targetTeamId: "TEAM-1",
        expectedRevision: 2,
        reason: "Phân công từ chi tiết Lead",
      }),
    ).resolves.toMatchObject({
      status: "ASSIGNED",
      ownership: { ownerStaff: "STAFF-1", owningTeam: "TEAM-1", revision: 3 },
    });

    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/leads/LEAD-2026-00001/assign`,
    );
    expect(bodyOf(0)).toEqual({
      ownerUserId: "STAFF-1",
      owningTeamId: "TEAM-1",
      reason: "Phân công từ chi tiết Lead",
      expectedRevision: 2,
    });
  });

  it("requires a target and a valid ownership revision for an assignment", async () => {
    await expect(
      assignLeadToStaff({
        lead: "LEAD-1",
        ownerStaff: "",
        targetTeamId: "TEAM-1",
        expectedRevision: 1,
      }),
    ).rejects.toMatchObject({ status: 400, code: "INVALID_ASSIGNMENT_TARGET" });
    await expect(
      assignLeadToStaff({
        lead: "LEAD-1",
        ownerStaff: "STAFF-1",
        targetTeamId: "TEAM-1",
        expectedRevision: -1,
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: "INVALID_OWNERSHIP_REVISION",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("normalizes detailed Lead audit metadata additively", () => {
    const result = normalizeLeadDetail({
      lead: {
        ...listFixture().data[0],
        email: "an@example.com",
        segments: [],
        enrollmentYear: null,
        conversionPotential: null,
        branch: "",
        tags: [],
        fptAspiration: "",
        eventsParticipated: [],
        description: "",
      },
      log: [
        {
          id: "assignment:1",
          type: "activity",
          title: "Thay đổi phân công Lead",
          author: "Sale",
          date: "2026-09-07T11:00:00+07:00",
          content: "Đã đổi người phụ trách.",
          category: "assignment",
          reason: "Phân công theo khu vực",
        },
      ],
      meta: {},
    });

    expect(result.log[0]).toMatchObject({
      category: "assignment",
      reason: "Phân công theo khu vực",
    });
  });

  it("normalizes a valid list envelope", () => {
    expect(normalizeLeadList(listFixture()).data).toHaveLength(1);
  });
});

describe("Lead write API contract", () => {
  it("retains reference IDs for catalog controls", () => {
    const ids = {
      provinceId: "province-uuid",
      wardId: "ward-uuid",
      highSchoolId: "school-uuid",
      majorId: "major-uuid",
      aspirationId: "aspiration-uuid",
      admissionYearId: "year-uuid",
      campusId: "campus-uuid",
      sourceId: "source-uuid",
    };
    expect(
      normalizeLeadDetail({
        lead: { ...leadRecord, ...ids },
        log: [],
        meta: {},
      }).lead,
    ).toMatchObject(ids);
  });

  it("preserves field validation details and request ID on a failed save", async () => {
    const details = [
      {
        field: "email",
        code: "invalid_format",
        message: "Invalid email address",
      },
    ];
    mockRoutes({
      "GET /api/v1/leads/LEAD-2026-00003": () => json({ data: leadRecord }),
      "PATCH /api/v1/leads/LEAD-2026-00003": () =>
        json(
          {
            error: {
              code: "INVALID_INPUT",
              message: "The request is invalid.",
              details,
              requestId: "request-1",
            },
          },
          400,
        ),
    });
    const error = await updateLead("LEAD-2026-00003", { email: "bad" }).catch(
      (error: unknown) => error,
    );
    expect(error).toMatchObject({
      status: 400,
      code: "INVALID_INPUT",
      details,
      requestId: "request-1",
    });
    expect((error as Error).message).toContain("email: Invalid email address");
  });

  it("sends explicit clears and reads the saved result back", async () => {
    let saved = false;
    mockRoutes({
      "GET /api/v1/leads/LEAD-2026-00003": () =>
        json({
          data: saved
            ? {
                ...leadRecord,
                email: "",
                source: "",
                sourceId: null,
                segments: [],
              }
            : leadRecord,
        }),
      "PATCH /api/v1/leads/LEAD-2026-00003": () => {
        saved = true;
        return json({ data: leadRecord });
      },
      "GET /api/v1/leads/LEAD-2026-00003/timeline": () => json({ data: [] }),
    });
    const result = await updateLead("LEAD-2026-00003", {
      email: null,
      source: null,
      segments: null,
    });
    expect(
      bodyOf(callKeys().indexOf("PATCH /api/v1/leads/LEAD-2026-00003")),
    ).toEqual({
      email: null,
      sourceId: null,
      segments: [],
      expectedRevision: 4,
    });
    expect(result.lead).toMatchObject({
      email: "",
      source: "",
      sourceId: null,
      segments: [],
    });
  });

  it("creates a Lead and reads the new record back", async () => {
    mockRoutes({
      "POST /api/v1/leads": () =>
        json({ data: { id: "LEAD-2026-00003" } }, 201),
      "GET /api/v1/leads/LEAD-2026-00003": () => json({ data: leadRecord }),
      "GET /api/v1/leads/LEAD-2026-00003/timeline": () => json({ data: [] }),
    });

    const result = await createLead({
      student_name: " Lê Văn Cường ",
      phone: "0922222222",
      province: "PROV-CT",
      ward: "WARD-CT-1",
      campaign: "CAMP-1",
      email: "cuong@example.com",
    });

    const post = callKeys().indexOf("POST /api/v1/leads");
    expect(bodyOf(post)).toEqual({
      studentName: "Lê Văn Cường",
      phone: "0922222222",
      provinceId: "PROV-CT",
      wardId: "WARD-CT-1",
      campaignId: "CAMP-1",
      email: "cuong@example.com",
    });
    expect(result.lead.name).toBe("Lê Văn Cường");
    expect(result.lead.province).toBe("Cần Thơ");
  });

  it("rejects a Lead without a name before calling the API", async () => {
    await expect(
      createLead({
        student_name: "  ",
        phone: "0900000000",
        province: "PROV-CT",
        campaign: "CAMP-1",
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: "INVALID_FIELDS",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("updates a Lead against its current revision", async () => {
    mockRoutes({
      "GET /api/v1/leads/LEAD-2026-00003": () => json({ data: leadRecord }),
      "PATCH /api/v1/leads/LEAD-2026-00003": () => json({ data: leadRecord }),
      "GET /api/v1/leads/LEAD-2026-00003/timeline": () => json({ data: [] }),
    });

    const result = await updateLead("LEAD-2026-00003", {
      student_name: "Lê Văn Cường",
      phone: "0922222222",
    });

    const patch = callKeys().indexOf("PATCH /api/v1/leads/LEAD-2026-00003");
    expect(bodyOf(patch)).toEqual({
      studentName: "Lê Văn Cường",
      phone: "0922222222",
      expectedRevision: 4,
    });
    expect(result.lead.name).toBe("Lê Văn Cường");
    expect(result.lead.phone).toBe("0922222222");
  });

  it("requires at least one field to update", async () => {
    await expect(updateLead("LEAD-1", {})).rejects.toMatchObject({
      status: 400,
      code: "INVALID_FIELDS",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("deletes a Lead", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(deleteLead("LEAD-2026-00004")).resolves.toEqual({
      deleted: "LEAD-2026-00004",
    });
    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/leads/LEAD-2026-00004`,
    );
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({ method: "DELETE" });
  });

  it("converts an assigned Lead into a new Student", async () => {
    fetchMock.mockResolvedValue(
      json({
        data: { id: "STU-2026-00001", studentStage: "New" },
        meta: { replayed: false },
      }),
    );

    await expect(convertLeadToStudent(" HS-2026-HCM-000005 ")).resolves.toEqual(
      {
        status: "CLOSED",
        resolution: "CREATED",
        lead: "HS-2026-HCM-000005",
        student: "STU-2026-00001",
        studentStage: "New",
      },
    );
    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/leads/HS-2026-HCM-000005/convert`,
    );
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({ method: "POST" });
  });
});

describe("Lead processing API contract", () => {
  it("processes a Lead through the processing command", async () => {
    fetchMock.mockResolvedValue(
      json({
        data: {
          id: "LEAD-2026-00003",
          status: "PROCESSED",
          resolution: "MATCHED",
          validation: { high_school: true, major: true },
        },
      }),
    );

    const result = await processLead({ lead: " LEAD-2026-00003 " });

    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/leads/LEAD-2026-00003/process`,
    );
    expect(result).toMatchObject({
      status: "PROCESSED",
      resolution: "MATCHED",
      lead: "LEAD-2026-00003",
    });
  });

  it("does not send PENDING to the processing command", async () => {
    await expect(
      processLead({ lead: "LEAD-2026-00003", resolution: "PENDING" as never }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<LeadApiError>>({
        status: 400,
        code: "INVALID_LEAD_RESOLUTION",
      }),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("updates the selected processing status", async () => {
    fetchMock.mockResolvedValue(
      json({
        data: {
          id: "LEAD-2026-00003",
          status: "ASSIGNED",
          resolution: "CREATED",
        },
      }),
    );

    const result = await updateLeadProcessingStatus({
      lead: " LEAD-2026-00003 ",
      status: "ASSIGNED",
      reason: "Đã xác minh",
    });

    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/leads/LEAD-2026-00003/status`,
    );
    expect(bodyOf(0)).toEqual({ status: "ASSIGNED", reason: "Đã xác minh" });
    expect(result).toMatchObject({
      status: "ASSIGNED",
      resolution: "CREATED",
      lead: "LEAD-2026-00003",
    });
  });

  it("rejects an unknown processing status before calling the API", async () => {
    await expect(
      updateLeadProcessingStatus({ lead: "LEAD-1", status: "BOGUS" as never }),
    ).rejects.toMatchObject({ status: 400, code: "INVALID_LEAD_STATUS" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reopens a closed Lead", async () => {
    fetchMock.mockResolvedValue(
      json({
        data: { id: "LEAD-2026-00003", status: "NEW", resolution: "PENDING" },
      }),
    );

    await expect(
      reopenLead({ lead: "LEAD-2026-00003", reason: "Khách gọi lại" }),
    ).resolves.toMatchObject({ status: "NEW", lead: "LEAD-2026-00003" });
    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/leads/LEAD-2026-00003/reopen`,
    );
    expect(bodyOf(0)).toEqual({ reason: "Khách gọi lại" });
  });

  it("scans the intake year through the bulk processing command", async () => {
    fetchMock.mockResolvedValue(
      json({
        summary: { scanned: 5, processed: 3, closed: 1, skipped: 1, failed: 0 },
        admissionYear: "2026",
      }),
    );

    const result = await processNewLeads({ admissionYear: 2026, limit: 50 });

    expect(fetchMock.mock.calls[0]![0]).toBe(`${API}/api/v1/leads/process-new`);
    expect(bodyOf(0)).toEqual({ admissionYear: 2026, limit: 50 });
    expect(result.summary).toEqual({
      scanned: 5,
      processed: 3,
      closed: 1,
      skipped: 1,
      failed: 0,
    });
  });

  it("loads a read-only processing preview with duplicate outcomes", async () => {
    fetchMock.mockResolvedValue(
      json({
        summary: {
          scanned: 2,
          readyToAssign: 1,
          matchedStudent: 0,
          duplicates: 1,
          invalid: 0,
          needsReview: 0,
        },
        items: [
          {
            lead: "LEAD-2026-00001",
            leadCode: "LD-2026-00001",
            studentName: "Nguyễn Minh An",
            phone: "0900000000",
            province: "Hồ Chí Minh",
            highSchool: "THPT Châu Văn Liêm",
            status: "PROCESSED",
            resolution: "PENDING",
            processingOutcome: "CREATED",
            reason: "Chưa phát hiện hồ sơ trùng.",
          },
          {
            lead: "LEAD-2026-00002",
            leadCode: "LD-2026-00002",
            studentName: "Trần Minh An",
            phone: "0900000000",
            province: "Hồ Chí Minh",
            highSchool: "THPT Châu Văn Liêm",
            status: "CLOSED",
            resolution: "DUPLICATE",
            processingOutcome: "DUPLICATE",
            duplicateOf: "LEAD-2026-00001",
            duplicateType: "PHONE_PROVINCE",
            reason: "Trùng số điện thoại và tỉnh/thành phố.",
          },
        ],
        admissionYear: "2026",
      }),
    );

    const result = await previewNewLeads({ admissionYear: 2026 });

    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/leads/process-new/preview`,
    );
    expect(bodyOf(0)).toEqual({ admissionYear: 2026 });
    expect(result.summary.duplicates).toBe(1);
    expect(result.items[1]).toMatchObject({
      studentName: "Trần Minh An",
      processingOutcome: "DUPLICATE",
      duplicateOf: "LEAD-2026-00001",
    });
  });

  it("rejects a malformed intake year before calling the bulk command", async () => {
    await expect(processNewLeads({ admissionYear: "20x6" })).rejects.toEqual(
      expect.objectContaining<Partial<LeadApiError>>({
        status: 400,
        code: "INVALID_ADMISSION_YEAR",
      }),
    );
    await expect(
      previewNewLeads({ admissionYear: "20x6" }),
    ).rejects.toMatchObject({ status: 400, code: "INVALID_ADMISSION_YEAR" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("Lead import API contract", () => {
  const csv = () =>
    new File(["Name,Phone\nAn,0900000000"], "leads.csv", { type: "text/csv" });

  it("previews an import with the campaign and source-index mapping", async () => {
    fetchMock.mockResolvedValue(
      json({
        filename: "leads.csv",
        total: 1,
        valid: 1,
        failed: 0,
        mappedFields: ["student_name", "phone"],
        ignoredColumns: [{ sourceIndex: 2, label: "Ignore" }],
        rows: [{ row: 3, fields: { student_name: "An" }, errors: [] }],
        errors: [],
      }),
    );
    const mapping = [
      { sourceIndex: 0, targetField: "student_name", enabled: true },
      { sourceIndex: 1, targetField: "phone", enabled: true },
      { sourceIndex: 2, targetField: null, enabled: false },
    ];

    const result = await previewLeadImport(csv(), "CAM-2026-00001", mapping);

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/leads/import/preview`);
    const form = init.body as FormData;
    expect(form.get("file")).toBeInstanceOf(File);
    expect(form.getAll("campaign_code")).toEqual(["CAM-2026-00001"]);
    expect(JSON.parse(String(form.get("column_mapping")))).toEqual(mapping);
    expect(result.mappedFields).toEqual(["student_name", "phone"]);
    expect(result.ignoredColumns).toEqual([
      { sourceIndex: 2, label: "Ignore" },
    ]);
  });

  it("previews without a campaign or mapping", async () => {
    fetchMock.mockResolvedValue(
      json({
        filename: "leads.csv",
        total: 2,
        valid: 1,
        failed: 1,
        rows: [
          {
            row: 2,
            fields: { student_name: "Nguyễn Văn An" },
            errors: [],
            processingOutcome: "MATCHED",
            targetStudent: "STU-1",
            reason: "Đã khớp hồ sơ học sinh.",
          },
        ],
        errors: [
          {
            row: 3,
            code: "INVALID_PHONE",
            message: "Số điện thoại không hợp lệ.",
          },
        ],
      }),
    );

    const result = await previewLeadImport(csv());

    const form = fetchMock.mock.calls[0]![1].body as FormData;
    expect(form.get("campaign_code")).toBeNull();
    expect(form.get("column_mapping")).toBeNull();
    expect(result).toMatchObject({ total: 2, valid: 1, failed: 1 });
    expect(result.rows[0]).toMatchObject({
      processingOutcome: "MATCHED",
      targetStudent: "STU-1",
    });
    expect(result.errors[0]?.code).toBe("INVALID_PHONE");
  });

  it("surfaces the API code and message for import validation errors", async () => {
    fetchMock.mockResolvedValue(
      json(
        {
          error: {
            code: "CAMPAIGN_STATUS_NOT_ALLOWED",
            message: "Chỉ chiến dịch đang hoạt động mới được dùng.",
          },
        },
        422,
      ),
    );

    await expect(previewLeadImport(csv(), "CAM-1")).rejects.toMatchObject({
      status: 422,
      code: "CAMPAIGN_STATUS_NOT_ALLOWED",
      message: "Chỉ chiến dịch đang hoạt động mới được dùng.",
    });
  });
});
