import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createLead,
  deleteLead,
  getLeadDetail,
  getLeadList,
  LeadApiError,
  normalizeLeadDetail,
  normalizeLeadList,
  processLead,
  processNewLeads,
  updateLeadProcessingStatus,
  updateLead,
} from "./leads";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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
      stats: { total: 1, inProgress: 1, closed: 0, conversionRate: 0 },
      asOf: "2026-09-07T10:00:00+07:00",
    },
  };
}

describe("Lead list/detail API contract", () => {
  it("serializes list filters and normalizes the Frappe message envelope", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: listFixture() }), {
        status: 200,
      }),
    );

    const result = await getLeadList(
      {
        admissionYear: 2026,
        page: 1,
        pageSize: 10,
        q: "Nguyễn",
        status: "NEW",
        resolution: "MATCHED",
        campaign: "CAM-2026-00001",
      },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.director_leads.get_director_leads?admissionYear=2026&page=1&pageSize=10&q=Nguy%E1%BB%85n&status=NEW&resolution=MATCHED&campaign=CAM-2026-00001",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(result.data[0]?.name).toBe("Nguyễn Minh An");
    expect(result.data[0]?.leadCode).toBe("LD-2026-00001");
    expect(result.data[0]?.studentCode).toBeNull();
    expect(result.data[0]?.studentId).toBeNull();
    expect(result.data[0]?.status).toBe("Đang xử lý");
    expect(result.data[0]?.statusCode).toBe("PROCESSED");
    expect(result.data[0]?.processingStatus).toBe("PROCESSED");
    expect(result.data[0]?.result).toBe("MATCHED");
    expect(result.data[0]?.contactNoAnswer).toBe(2);
    expect(result.data[0]?.contactSuccess).toBe(3);
    expect(result.data[0]?.createdAt).toBe("2026-09-07T10:00:00+07:00");
    expect(result.meta.statusOptions).toEqual([{ value: "NEW", label: "Mới" }]);
    expect(result.meta.resolution).toBe("MATCHED");
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
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: { data: "not-an-array" } }), {
        status: 200,
      }),
    );

    await expect(
      getLeadList({}, { baseUrl: "http://frappe:8000" }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<LeadApiError>>({
        status: 502,
        code: "INVALID_LEAD_LIST_RESPONSE",
      }),
    );
  });

  it("maps a missing Lead detail to null", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: { code: "LEAD_NOT_FOUND" } }), {
        status: 404,
      }),
    );

    await expect(
      getLeadDetail("LEAD-MISSING", { baseUrl: "http://frappe:8000" }),
    ).resolves.toBeNull();
  });

  it("calls the detail endpoint and normalizes the Lead projection", async () => {
    const detail = {
      lead: {
        ...listFixture().data[0],
        email: "an@example.com",
        secondaryEmail: "",
        province: "Cần Thơ",
        ward: "Phường An Cư",
        interestedMajor: "Trí tuệ nhân tạo",
        adChannel: "Facebook Ads",
        segments: ["Quan tâm học bổng"],
        enrollmentYear: 2026,
        conversionPotential: "Cao",
        branch: "Cần Thơ",
        tags: [],
        fptAspiration: "Nguyện vọng 1",
        eventsParticipated: [],
        description: "Lead quan tâm tuyển sinh.",
      },
      log: [
        {
          id: "status:1",
          type: "activity",
          title: "Cập nhật tình trạng Lead",
          author: "Administrator",
          date: "2026-09-07T11:00:00+07:00",
          content:
            'Processing Status được cập nhật từ "NEW" sang "PROCESSING".',
          event_type: "processing_status_changed",
          category: "processing",
          fieldname: "processing_status",
          field_label: "Processing Status",
          old_value: "NEW",
          new_value: "PROCESSING",
          source: "Version",
        },
      ],
      meta: {},
    };
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ message: detail }), { status: 200 }),
      );

    const result = await getLeadDetail("LEAD-2026-00001", {
      baseUrl: "http://frappe:8000",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.director_leads.get_director_lead?lead_id=LEAD-2026-00001",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(result?.lead.email).toBe("an@example.com");
    expect(result?.lead.ward).toBe("Phường An Cư");
    expect(result?.lead.segments).toEqual(["Quan tâm học bổng"]);
    expect(result?.log[0]).toMatchObject({
      eventType: "processing_status_changed",
      category: "processing",
      oldValue: "NEW",
      newValue: "PROCESSING",
      source: "Version",
    });
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

  it("normalizes a CRUD Lead document returned directly by Frappe", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            name: "LEAD-2026-00002",
            lead_code: "LD-2026-00002",
            processing_status: "ASSIGNED",
            resolution: "MATCHED",
            student_name: "Trần Thị Bình",
            phone: "0911111111",
            email: "binh@example.com",
            other_email: "binh.alt@example.com",
            high_school: "THPT Nguyễn Huệ",
            province: "Hà Nội",
            ward: "Phường Hoàn Kiếm",
            major: "Kỹ thuật phần mềm",
            aspiration: "Nguyện vọng 1",
            admission_year: "2026",
            conversion_potential: "High",
            branch: "Hà Nội",
            segments: '["Quan tâm học bổng"]',
            notes: "Đăng ký từ landing page.",
            owner_staff: "staff-01",
            creation: "2026-09-08 09:00:00",
            modified: "2026-09-08 10:00:00",
          },
        }),
        { status: 200 },
      ),
    );

    const result = await getLeadDetail("LEAD-2026-00002", {
      baseUrl: "http://frappe:8000",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.director_leads.get_director_lead?lead_id=LEAD-2026-00002",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(result).toMatchObject({
      lead: {
        id: "LEAD-2026-00002",
        leadCode: "LD-2026-00002",
        initials: "TB",
        name: "Trần Thị Bình",
        statusCode: "ASSIGNED",
        processingStatus: "ASSIGNED",
        result: "MATCHED",
        secondaryEmail: "binh.alt@example.com",
        ward: "Phường Hoàn Kiếm",
        interestedMajor: "Kỹ thuật phần mềm",
        enrollmentYear: 2026,
        conversionPotential: "Cao",
        segments: ["Quan tâm học bổng"],
        description: "Đăng ký từ landing page.",
        owner: "staff-01",
      },
      log: [],
      meta: { asOf: "2026-09-08 10:00:00" },
    });
  });

  it("creates a Lead through the CRUD endpoint", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            name: "LEAD-2026-00003",
            student_name: "Lê Văn Cường",
            phone: "0922222222",
            province: "Cần Thơ",
            source: "Website",
          },
        }),
        { status: 200 },
      ),
    );

    const result = await createLead(
      {
        student_name: " Lê Văn Cường ",
        phone: "0922222222",
        province: "Cần Thơ",
        ward: "WARD-CT-1",
        source: "Website",
        email: "cuong@example.com",
      },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.lead.create_lead",
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        body: JSON.stringify({
          fields: {
            student_name: " Lê Văn Cường ",
            phone: "0922222222",
            province: "Cần Thơ",
            ward: "WARD-CT-1",
            source: "Website",
            email: "cuong@example.com",
          },
        }),
      }),
    );
    expect(result.lead.name).toBe("Lê Văn Cường");
    expect(result.lead.province).toBe("Cần Thơ");
  });

  it("updates a Lead through the CRUD endpoint", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            name: "LEAD-2026-00003",
            student_name: "Lê Văn Cường",
            phone: "0922222222",
          },
        }),
        { status: 200 },
      ),
    );

    const result = await updateLead(
      "LEAD-2026-00003",
      { student_name: "Lê Văn Cường", phone: "0922222222" },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.lead.update_lead",
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        body: JSON.stringify({
          name: "LEAD-2026-00003",
          fields: { student_name: "Lê Văn Cường", phone: "0922222222" },
        }),
      }),
    );
    expect(result.lead.name).toBe("Lê Văn Cường");
    expect(result.lead.phone).toBe("0922222222");
  });

  it("gets the browser CSRF token from the session when the Frappe cookie is cross-origin", async () => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("document", { cookie: "" });
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: {
              user: "sales@example.com",
              csrf_token: "csrf-from-session",
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: {
              name: "LEAD-2026-00003",
              student_name: "Lê Văn Cường",
            },
          }),
          { status: 200 },
        ),
      );

    await updateLead(
      "LEAD-2026-00003",
      { student_name: "Lê Văn Cường" },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      "http://frappe:8000/api/method/crm.api.session.me",
      {
        credentials: "include",
        headers: { Accept: "application/json" },
      },
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      "http://frappe:8000/api/method/crm.api.lead.update_lead",
      expect.objectContaining({
        credentials: "include",
        headers: expect.objectContaining({
          "X-Frappe-CSRF-Token": "csrf-from-session",
        }),
      }),
    );
  });

  it("processes a Lead through the processing command", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            status: "PROCESSED",
            resolution: "MATCHED",
            lead: "LEAD-2026-00003",
            target_student: "STU-00001",
            validation: { high_school: true, major: true },
          },
        }),
        { status: 200 },
      ),
    );

    const result = await processLead(
      {
        lead: " LEAD-2026-00003 ",
        resolution: "MATCHED",
        reason: "Đã xác minh thông tin",
      },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.lead_processing.process_lead",
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        body: JSON.stringify({
          lead: "LEAD-2026-00003",
          resolution: "MATCHED",
          reason: "Đã xác minh thông tin",
        }),
      }),
    );
    expect(result).toMatchObject({
      status: "PROCESSED",
      resolution: "MATCHED",
      lead: "LEAD-2026-00003",
      targetStudent: "STU-00001",
    });
  });

  it("does not send PENDING to the processing command", async () => {
    await expect(
      processLead(
        { lead: "LEAD-2026-00003", resolution: "PENDING" as never },
        { baseUrl: "http://frappe:8000" },
      ),
    ).rejects.toEqual(
      expect.objectContaining<Partial<LeadApiError>>({
        status: 400,
        code: "INVALID_LEAD_RESOLUTION",
      }),
    );
  });

  it("scans the intake year through the bulk processing command", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            summary: {
              scanned: 5,
              processed: 3,
              closed: 1,
              skipped: 1,
              failed: 0,
            },
            admissionYear: "2026",
          },
        }),
        { status: 200 },
      ),
    );

    const result = await processNewLeads(
      { admissionYear: 2026 },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.lead_processing.process_new_leads",
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        body: JSON.stringify({ admission_year: "2026" }),
      }),
    );
    expect(result.summary).toEqual({
      scanned: 5,
      processed: 3,
      closed: 1,
      skipped: 1,
      failed: 0,
    });
  });

  it("rejects a malformed intake year before calling the bulk command", async () => {
    await expect(
      processNewLeads({ admissionYear: "20x6" }, { baseUrl: "http://frappe:8000" }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<LeadApiError>>({
        status: 400,
        code: "INVALID_ADMISSION_YEAR",
      }),
    );
  });

  it("updates the selected processing status through the status command", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            status: "ASSIGNED",
            resolution: "CREATED",
            lead: "LEAD-2026-00003",
            validation: {},
          },
        }),
        { status: 200 },
      ),
    );

    const result = await updateLeadProcessingStatus(
      { lead: " LEAD-2026-00003 ", status: "ASSIGNED" },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.lead_processing.update_processing_status",
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        body: JSON.stringify({
          lead: "LEAD-2026-00003",
          status: "ASSIGNED",
        }),
      }),
    );
    expect(result).toMatchObject({
      status: "ASSIGNED",
      resolution: "CREATED",
      lead: "LEAD-2026-00003",
    });
  });

  it("deletes a Lead through the CRUD endpoint", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({ message: { deleted: "LEAD-2026-00004" } }),
          { status: 200 },
        ),
      );

    await expect(
      deleteLead("LEAD-2026-00004", { baseUrl: "http://frappe:8000" }),
    ).resolves.toEqual({ deleted: "LEAD-2026-00004" });
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.lead.delete_lead",
      expect.objectContaining({
        method: "DELETE",
        cache: "no-store",
        body: JSON.stringify({ name: "LEAD-2026-00004" }),
      }),
    );
  });

  it("normalizes a valid detail response without changing empty arrays", () => {
    const detail = {
      lead: {
        ...listFixture().data[0],
        email: "an@example.com",
        secondaryEmail: "",
        province: "Cần Thơ",
        interestedMajor: "Trí tuệ nhân tạo",
        adChannel: "Facebook Ads",
        segments: [],
        enrollmentYear: null,
        conversionPotential: null,
        branch: "Cần Thơ",
        tags: [],
        fptAspiration: "",
        eventsParticipated: [],
        description: "",
      },
      log: [],
      meta: {},
    };

    expect(normalizeLeadList({ message: listFixture() }).data).toHaveLength(1);
    expect(detail.log).toEqual([]);
  });
});
