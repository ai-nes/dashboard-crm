import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSchoolArea, createWard, listProvinces, listSchools } from ".";

describe("reference catalog API", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_FRAPPE_URL", "http://frappe:8000");
    vi.restoreAllMocks();
  });

  it("loads provinces with filters and pagination", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            provinces: [
              {
                id: "HCM",
                code: "79",
                name: "Thành phố Hồ Chí Minh",
              },
            ],
            total: 1,
            start: 0,
            page_length: 8,
          },
        }),
        { status: 200 },
      ),
    );

    await expect(
      listProvinces({
        search: "Hồ Chí Minh",
        cityType: "Centrally Controlled City",
        start: 0,
        pageLength: 8,
      }),
    ).resolves.toMatchObject({ provinces: [{ id: "HCM" }], total: 1 });

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.geography_catalog.list_provinces?search=H%E1%BB%93+Ch%C3%AD+Minh&city_type=Centrally+Controlled+City&start=0&page_length=8",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("filters schools by province and ward", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            schools: [
              {
                id: "school-1",
                code: "001",
                name: "THPT Test",
                province: "HCM",
                ward: "ward-1",
                isActive: true,
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );

    await expect(
      listSchools({ province: "HCM", ward: "ward-1" }),
    ).resolves.toMatchObject({ schools: [{ province: "HCM", ward: "ward-1" }] });
  });

  it("sends school area mutations through the admission catalog RPC", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            id: "KV5",
            code: "KV5",
            name: "Khu vực 5",
            enabled: true,
            sortOrder: 50,
          },
        }),
        { status: 200 },
      ),
    );

    await createSchoolArea({
      code: "KV5",
      display_name: "Khu vực 5",
      enabled: true,
      sort_order: 50,
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.geography_catalog.create_school_area",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          data: {
            code: "KV5",
            display_name: "Khu vực 5",
            enabled: true,
            sort_order: 50,
          },
        }),
      }),
    );
  });

  it("surfaces Frappe server validation messages for ward mutations", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          _server_messages: JSON.stringify([
            JSON.stringify({ message: "Ward code đã tồn tại." }),
          ]),
        }),
        { status: 417 },
      ),
    );

    await expect(
      createWard({
        ward_code: "3213123",
        ward_name: "Hàm Mỹ",
        ward_type: "Commune",
        province: "Quảng Trị",
      }),
    ).rejects.toThrow("Ward code đã tồn tại.");
  });
});
