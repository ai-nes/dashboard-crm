import { afterEach, describe, expect, it, vi } from "vitest";

import {
  computeDirectorDemographicsOverview,
  computeDirectorDemographicsSegment,
  DirectorDemographicsApiError,
  getDirectorDemographicsOverview,
  getDirectorDemographicsSegment,
} from "./index";

afterEach(() => vi.restoreAllMocks());

describe("director demographics API contract", () => {
  it("computes full overview data with valid structure when offline", async () => {
    const data = await getDirectorDemographicsOverview({ admissionYear: 2026, period: "6m", scope: "all" });

    expect(data.meta.admissionYear).toBe(2026);
    expect(data.data.kpis.length).toBeGreaterThan(0);
    expect(data.data.segments.length).toBeGreaterThan(0);
    expect(data.data.acquisitionMap.formFunnel.length).toBeGreaterThan(0);
    expect(data.data.acquisitionMap.attributionModel.firstTouch).toBe("first-touch");
    expect(data.data.acquisitionMap.submissionTiming.timezone).toBe("Asia/Ho_Chi_Minh");
    expect(data.meta.page).toBe(1);
    expect(data.meta.pageSize).toBe(10);
    expect(data.meta.total).toBeGreaterThanOrEqual(data.data.segments.length);
  });

  it("paginates segments after ranking when offline", async () => {
    const firstPage = await getDirectorDemographicsOverview({ page: 1, pageSize: 2 });
    const secondPage = await getDirectorDemographicsOverview({ page: 2, pageSize: 2 });

    expect(firstPage.data.segments).toHaveLength(2);
    expect(secondPage.data.segments).toHaveLength(2);
    expect(firstPage.data.segments[0]?.opportunityScore).toBeGreaterThanOrEqual(
      secondPage.data.segments[0]?.opportunityScore ?? 0,
    );
    expect(firstPage.meta.total).toBe(secondPage.meta.total);
    expect(firstPage.meta.totalPages).toBe(3);
    expect(firstPage.meta.hasNextPage).toBe(true);
    expect(secondPage.meta.page).toBe(2);
  });

  it("calls Frappe overview endpoint with parameters and validates envelope", async () => {
    const mockOverview = computeDirectorDemographicsOverview({ admissionYear: 2026 });
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: mockOverview }), { status: 200 }),
    );

    const result = await getDirectorDemographicsOverview(
      { admissionYear: 2026, period: "6m", scope: "all" },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.director_demographics.get_director_demographics_overview?admissionYear=2026&period=6m&scope=all",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(result.data.kpis.length).toBe(mockOverview.data.kpis.length);
    expect(result.meta.admissionYear).toBe(2026);
  });

  it("accepts the current backend overview without pagination or acquisition-map data", async () => {
    const mockOverview = computeDirectorDemographicsOverview({ admissionYear: 2026 });
    const { acquisitionMap: _acquisitionMap, ...data } = mockOverview.data;
    const { page: _page, pageSize: _pageSize, total: _total, totalPages: _totalPages, hasNextPage: _hasNextPage, ...meta } = mockOverview.meta;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: { data, meta } }), { status: 200 }),
    );

    await expect(
      getDirectorDemographicsOverview({ admissionYear: 2026 }, { baseUrl: "http://frappe:8000" }),
    ).resolves.toEqual(expect.objectContaining({ meta: expect.objectContaining({ admissionYear: 2026 }) }));
  });

  it("passes overview pagination parameters to Frappe", async () => {
    const mockOverview = computeDirectorDemographicsOverview({ page: 2, pageSize: 2 });
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: mockOverview }), { status: 200 }),
    );

    await getDirectorDemographicsOverview(
      { admissionYear: 2026, page: 2, pageSize: 2, period: "6m", scope: "all" },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.director_demographics.get_director_demographics_overview?admissionYear=2026&page=2&pageSize=2&period=6m&scope=all",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("throws DirectorDemographicsApiError on authorization failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ error: { code: "FORBIDDEN", message: "Không có quyền truy cập." } }),
        { status: 403 },
      ),
    );

    await expect(
      getDirectorDemographicsOverview({ admissionYear: 2026 }, { baseUrl: "http://frappe:8000" }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<DirectorDemographicsApiError>>({
        status: 403,
        code: "FORBIDDEN",
      }),
    );
  });

  it("rejects invalid overview envelope with 502", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: { data: { kpis: "invalid" } } }), { status: 200 }),
    );

    await expect(
      getDirectorDemographicsOverview({ admissionYear: 2026 }, { baseUrl: "http://frappe:8000" }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<DirectorDemographicsApiError>>({
        status: 502,
        code: "INVALID_DEMOGRAPHICS_RESPONSE",
      }),
    );
  });

  it("calls Frappe segment endpoint and maps 404 to null", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ error: { code: "SEGMENT_NOT_FOUND", message: "Không tìm thấy phân khúc." } }),
        { status: 404 },
      ),
    );

    const result = await getDirectorDemographicsSegment(
      { segment_id: "non-existent", admissionYear: 2026 },
      { baseUrl: "http://frappe:8000" },
    );

    expect(result).toBeNull();
  });

  it("calls Frappe segment endpoint successfully with valid payload", async () => {
    const mockSegment = computeDirectorDemographicsSegment({ segment_id: "female-ai-dong-nai" });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: mockSegment }), { status: 200 }),
    );

    const result = await getDirectorDemographicsSegment(
      { segment_id: "female-ai-dong-nai", admissionYear: 2026 },
      { baseUrl: "http://frappe:8000" },
    );

    expect(result).not.toBeNull();
    expect(result?.data.segment.id).toBe("female-ai-dong-nai");
  });

  it("rejects invalid segment envelope with 502", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: { data: { segment: null } } }), { status: 200 }),
    );

    await expect(
      getDirectorDemographicsSegment(
        { segment_id: "female-ai-dong-nai", admissionYear: 2026 },
        { baseUrl: "http://frappe:8000" },
      ),
    ).rejects.toEqual(
      expect.objectContaining<Partial<DirectorDemographicsApiError>>({
        status: 502,
        code: "INVALID_SEGMENT_RESPONSE",
      }),
    );
  });
});
