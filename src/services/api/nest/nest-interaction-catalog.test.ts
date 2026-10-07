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

const row = (code: string, sortOrder: number, enabled = true) => ({
  id: `id-${code}`,
  code,
  displayName: `Tên ${code}`,
  enabled,
  sortOrder,
  description: null,
});

describe("interaction catalog with the Nest backend", () => {
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

  it("reads both catalogs from reference data and never calls Frappe", async () => {
    fetchMock.mockImplementation((url: string) =>
      json({
        data: String(url).includes("interaction-types")
          ? [row("CALL", 2), row("VISIT", 1), row("OLD", 0, false)]
          : [row("ADMISSION_PROCESS", 1)],
      }),
    );
    const { getInteractionCatalog } = await import("../interaction-intelligence");
    const catalog = await getInteractionCatalog();

    expect(catalog.interactionTypes.map((item) => item.code)).toEqual([
      "VISIT",
      "CALL",
    ]);
    expect(catalog.interactionTypes[0]?.display_name).toBe("Tên VISIT");
    expect(catalog.intentTypes.map((item) => item.code)).toEqual([
      "ADMISSION_PROCESS",
    ]);
    const urls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(urls.every((url) => url.startsWith("http://api.test/"))).toBe(true);
  });

  it("fails fast with 501 for interaction feeds not served yet", async () => {
    const { listInteractions } = await import("../interaction-intelligence");
    await expect(listInteractions({ student: "HS-1" })).rejects.toMatchObject({
      status: 501,
      code: "FEATURE_NOT_MIGRATED",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
