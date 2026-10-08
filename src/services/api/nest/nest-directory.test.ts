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

describe("student school update with the Nest backend", () => {
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

  it("maps field options and forwards province filters", async () => {
    fetchMock.mockImplementation(() =>
      json({
        fieldtype: "Link",
        options: [{ value: "w1", label: "Phường 1" }],
      }),
    );
    const { getFieldOptions } = await import("../student-school-update");
    const result = await getFieldOptions({
      doctype: "CRM Lead",
      fieldname: "ward",
      province: "HCM",
      search: "1",
      limit: 20,
    });
    expect(result).toMatchObject({
      doctype: "CRM Lead",
      fieldname: "ward",
      fieldtype: "Link",
      options: [{ value: "w1", label: "Phường 1" }],
    });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "http://api.test/api/v1/options/ward?search=1&limit=20&province=HCM",
    );
  });

  it("returns schools in the list shape", async () => {
    fetchMock.mockImplementation(() =>
      json({
        schools: [
          {
            id: "s1",
            schoolCode: "C1",
            schoolName: "THPT A",
            province: "HCM",
            ward: "P1",
            address: null,
            phone: null,
            email: null,
            schoolTier: "A",
          },
        ],
      }),
    );
    const { getSchools } = await import("../student-school-update");
    const result = await getSchools({ search: "A", limit: 5 });
    expect(result.schools).toEqual([
      {
        name: "s1",
        fields: expect.objectContaining({
          school_name: "THPT A",
          school_code: "C1",
          province: "HCM",
          ward: "P1",
        }),
      },
    ]);
  });

  it("reports Nest failures as StudentSchoolUpdateApiError", async () => {
    fetchMock.mockImplementation(() =>
      json({ error: { code: "UNKNOWN_FIELD", message: "Không có." } }, 404),
    );
    const { getFieldOptions } = await import("../student-school-update");
    await expect(
      getFieldOptions({ doctype: "CRM Lead", fieldname: "nonsense" }),
    ).rejects.toMatchObject({ status: 404, code: "UNKNOWN_FIELD" });
  });
});
