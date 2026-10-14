import { afterEach, describe, expect, it, vi } from "vitest";
import { nestDownload } from "./nest-download";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
describe("authenticated workbook download", () => {
  it("sends selected IDs with cookie auth and returns binary bytes", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(new Uint8Array([80, 75, 3, 4]), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      }),
    );
    const blob = await nestDownload("/api/v1/students/export", {
      method: "POST",
      body: { studentIds: ["uuid"] },
    });
    expect([...new Uint8Array(await blob.arrayBuffer())]).toEqual([
      80, 75, 3, 4,
    ]);
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://api.test/api/v1/students/export",
      expect.objectContaining({
        credentials: "include",
        method: "POST",
        body: '{"studentIds":["uuid"]}',
      }),
    );
  });
  it("throws the API error instead of downloading a JSON error as Excel", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: "FORBIDDEN", message: "No export permission" },
        }),
        { status: 403 },
      ),
    );
    await expect(nestDownload("/api/v1/students/export")).rejects.toMatchObject(
      { status: 403, code: "FORBIDDEN" },
    );
  });
});
