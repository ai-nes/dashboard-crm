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

const FRAPPE = "http://frappe.test/api/method";

describe("frappe request with the Nest backend enabled", () => {
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

  it("serves admission years from reference data in the Frappe shape", async () => {
    fetchMock.mockImplementation(() =>
      json({
        data: [
          {
            id: "y1",
            name: "2026",
            startDate: "2026-01-01T00:00:00.000Z",
            endDate: null,
            isActive: true,
          },
        ],
        meta: { pagination: { total: 1 } },
      }),
    );
    const { request } = await import("../frappe-request");
    const result = await request(
      `${FRAPPE}/crm.api.admin_catalog.list_admission_years?search=26&page_length=10`,
    );
    expect(result).toMatchObject({
      total: 1,
      years: [
        {
          name: "y1",
          year_name: "2026",
          start_date: "2026-01-01",
          is_active: 1,
        },
      ],
    });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "http://api.test/api/v1/reference-data/admission-years?q=26&pageSize=10",
    );
  });

  it("maps offering approval to the transition endpoint", async () => {
    fetchMock.mockImplementation(() => json({ name: "o1", status: "Active" }));
    const { request } = await import("../frappe-request");
    await request(
      `${FRAPPE}/crm.api.admin_catalog.transition_admission_offering`,
      {
        method: "POST",
        body: JSON.stringify({
          name: "o1",
          status: "Active",
          expected_modified: "m1",
        }),
      },
    );
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "http://api.test/api/v1/admission-offerings/o1/transition",
    );
    expect(JSON.parse(init.body as string)).toEqual({
      status: "Active",
      expectedModified: "m1",
    });
  });

  it("turns Nest errors into the caller's error class", async () => {
    fetchMock.mockImplementation(() =>
      json({ error: { code: "ACTIVE_IMMUTABLE", message: "No." } }, 409),
    );
    const { request } = await import("../frappe-request");
    await expect(
      request(`${FRAPPE}/crm.api.admin_catalog.delete_admission_offering`, {
        method: "POST",
        body: JSON.stringify({ name: "o1" }),
      }),
    ).rejects.toMatchObject({ status: 409, code: "ACTIVE_IMMUTABLE" });
  });

  it("fails fast with 501 for methods the Nest backend lacks", async () => {
    const { request } = await import("../frappe-request");
    await expect(
      request(`${FRAPPE}/crm.api.admin_catalog.list_score_templates`),
    ).rejects.toMatchObject({ status: 501, code: "FEATURE_NOT_MIGRATED" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("serves the geography catalog and channel types from Nest", async () => {
    fetchMock.mockImplementation(() =>
      json({ provinces: [], total: 0, channelTypes: [], start: 0 }),
    );
    const { request } = await import("../frappe-request");
    await request(
      `${FRAPPE}/crm.api.geography_catalog.list_provinces?search=a&page_length=5`,
    );
    await request(
      `${FRAPPE}/crm.api.campaign_channel_type.list_campaign_channel_types`,
    );
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "http://api.test/api/v1/geography-catalog/provinces?search=a&page_length=5",
    );
    expect(String(fetchMock.mock.calls[1][0])).toContain(
      "/api/v1/campaign-channel-types",
    );
  });
});
