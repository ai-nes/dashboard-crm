import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

describe("features the Nest backend does not serve yet", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    vi.stubEnv("NEXT_PUBLIC_FRAPPE_URL", "http://frappe.test");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("fails fast with 501 and never calls Frappe", async () => {
    const { getStudentWorklistActions } = await import("../student-worklist");
    await expect(getStudentWorklistActions("HS-1")).rejects.toMatchObject({
      status: 501,
      code: "FEATURE_NOT_MIGRATED",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not use a 403, which would redirect to access-denied", async () => {
    const { getStudentWorklistActions } = await import("../student-worklist");
    const error = await getStudentWorklistActions("HS-1").catch(
      (value: unknown) => value,
    );
    const { isForbiddenApiError } = await import("../forbidden-redirect");
    expect(isForbiddenApiError(error)).toBe(false);
  });
});
