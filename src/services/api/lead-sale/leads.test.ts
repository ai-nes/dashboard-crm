import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getLeadDetail,
  getLeadList,
  LeadApiError,
  normalizeLeadDetail,
  normalizeLeadList,
} from "./leads";

afterEach(() => vi.restoreAllMocks());

function listFixture() {
  return {
    data: [
      {
        id: "LEAD-2026-00001",
        leadCode: "LD-2026-00001",
        studentId: "LEAD-2026-00001",
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
        campaign: "CAM-2026-00001",
      },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.director_leads.get_director_leads?admissionYear=2026&page=1&pageSize=10&q=Nguy%E1%BB%85n&status=NEW&campaign=CAM-2026-00001",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(result.data[0]?.name).toBe("Nguyễn Minh An");
    expect(result.data[0]?.leadCode).toBe("LD-2026-00001");
    expect(result.data[0]?.studentId).toBe("LEAD-2026-00001");
    expect(result.data[0]?.status).toBe("Đang xử lý");
    expect(result.data[0]?.statusCode).toBe("PROCESSED");
    expect(result.data[0]?.processingStatus).toBe("PROCESSED");
    expect(result.data[0]?.result).toBe("MATCHED");
    expect(result.data[0]?.contactNoAnswer).toBe(2);
    expect(result.data[0]?.contactSuccess).toBe(3);
    expect(result.data[0]?.createdAt).toBe("2026-09-07T10:00:00+07:00");
    expect(result.meta.statusOptions).toEqual([{ value: "NEW", label: "Mới" }]);
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
          content: 'Enrollment Status được cập nhật từ "Mới" sang "Có triển vọng".',
          event_type: "status_changed",
          category: "status",
          fieldname: "enrollment_status",
          field_label: "Enrollment Status",
          old_value: "Mới",
          new_value: "Có triển vọng",
          metadata: { old_code: "NEW", new_code: "PROSPECT" },
          source: "Status Change Log",
        },
      ],
      meta: {},
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: detail }), { status: 200 }),
    );

    const result = await getLeadDetail("LEAD-2026-00001", {
      baseUrl: "http://frappe:8000",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.lead.get_lead?name=LEAD-2026-00001",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(result?.lead.email).toBe("an@example.com");
    expect(result?.lead.segments).toEqual(["Quan tâm học bổng"]);
    expect(result?.log[0]).toMatchObject({
      eventType: "status_changed",
      category: "status",
      oldValue: "Mới",
      newValue: "Có triển vọng",
      metadata: { old_code: "NEW", new_code: "PROSPECT" },
      source: "Status Change Log",
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
      "http://frappe:8000/api/method/crm.api.lead.get_lead?name=LEAD-2026-00002",
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
