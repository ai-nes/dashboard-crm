import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createSchoolArea,
  createWard,
  listGeographyOptions,
  listProvinces,
  listSchools,
  ReferenceCatalogApiError,
} from ".";

const API = "http://localhost:3001";
const fetchMock = vi.fn();
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

describe("reference catalog API", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("loads provinces with filters and pagination", async () => {
    fetchMock.mockImplementation(async () =>
      json({
        provinces: [{ id: "HCM", code: "79", name: "Thành phố Hồ Chí Minh" }],
        total: 1,
        start: 0,
        page_length: 8,
      }),
    );

    await expect(
      listProvinces({
        search: "Hồ Chí Minh",
        cityType: "Centrally Controlled City",
        start: 0,
        pageLength: 8,
      }),
    ).resolves.toMatchObject({
      provinces: [{ id: "HCM" }],
      total: 1,
      pageLength: 8,
    });

    const url = new URL(fetchMock.mock.calls[0]![0]);
    expect(url.pathname).toBe("/api/v1/geography-catalog/provinces");
    expect(url.searchParams.get("search")).toBe("Hồ Chí Minh");
    expect(url.searchParams.get("city_type")).toBe("Centrally Controlled City");
    expect(url.searchParams.get("page_length")).toBe("8");
  });

  it("filters schools by province and ward", async () => {
    fetchMock.mockImplementation(async () =>
      json({
        schools: [{ id: "school-1", province: "HCM", ward: "ward-1" }],
      }),
    );

    await expect(
      listSchools({ province: "HCM", ward: "ward-1" }),
    ).resolves.toMatchObject({
      schools: [{ province: "HCM", ward: "ward-1" }],
    });
    const url = new URL(fetchMock.mock.calls[0]![0]);
    expect(url.pathname).toBe("/api/v1/geography-catalog/high-schools");
    expect(url.searchParams.get("ward")).toBe("ward-1");
  });

  it("rejects geography options without provinces and wards", async () => {
    fetchMock.mockImplementation(async () => json({ provinces: [] }));

    await expect(listGeographyOptions()).rejects.toMatchObject({
      status: 502,
      code: "INVALID_GEOGRAPHY_OPTIONS_RESPONSE",
    });
  });

  it("creates a school area", async () => {
    fetchMock.mockImplementation(async () => json({ id: "KV5", code: "KV5" }));
    const data = {
      code: "KV5",
      display_name: "Khu vực 5",
      enabled: true,
      sort_order: 50,
    };

    await createSchoolArea(data);

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/geography-catalog/school-areas`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ data });
  });

  it("surfaces API validation messages for ward mutations", async () => {
    fetchMock.mockImplementation(async () =>
      json(
        { error: { code: "DUPLICATE", message: "Ward code đã tồn tại." } },
        409,
      ),
    );

    const failure = createWard({
      ward_code: "3213123",
      ward_name: "Hàm Mỹ",
      ward_type: "Commune",
      province: "Quảng Trị",
    });
    await expect(failure).rejects.toThrow("Ward code đã tồn tại.");
    await expect(failure).rejects.toBeInstanceOf(ReferenceCatalogApiError);
  });
});
