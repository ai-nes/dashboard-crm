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

describe("director school detail with the Nest backend", () => {
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

  it("calls the Nest school endpoint with the admission year", async () => {
    fetchMock.mockImplementation(() =>
      json({
        status: "available",
        school: { id: "79-26734-007", name: "THPT A" },
        meta: { admissionYear: 2026 },
      }),
    );
    const { getDirectorSchoolDetail } =
      await import("../schools/school-intelligence");
    const result = await getDirectorSchoolDetail("79-26734-007", {
      admissionYear: 2026,
    });
    expect(result).not.toBeNull();
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/director/schools/79-26734-007?admissionYear=2026",
    );
  });

  it("returns null for an unknown school and maps other errors", async () => {
    fetchMock.mockImplementationOnce(() =>
      json({ error: { code: "SCHOOL_NOT_FOUND", message: "x" } }, 404),
    );
    const { getDirectorSchoolDetail, DirectorApiError } =
      await import("../schools/school-intelligence");
    await expect(getDirectorSchoolDetail("79-26734-999")).resolves.toBeNull();
    fetchMock.mockImplementationOnce(() =>
      json({ error: { code: "FORBIDDEN", message: "Không có quyền" } }, 403),
    );
    await expect(
      getDirectorSchoolDetail("79-26734-007"),
    ).rejects.toBeInstanceOf(DirectorApiError);
  });
});
