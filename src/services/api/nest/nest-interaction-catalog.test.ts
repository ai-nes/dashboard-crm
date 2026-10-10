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
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reads both catalogs from reference data", async () => {
    fetchMock.mockImplementation((url: string) =>
      json({
        data: String(url).includes("interaction-types")
          ? [row("CALL", 2), row("VISIT", 1), row("OLD", 0, false)]
          : [row("ADMISSION_PROCESS", 1)],
      }),
    );
    const { getInteractionCatalog } =
      await import("../interaction-intelligence");
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

  it("lists, creates and reads student interactions from Nest", async () => {
    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === "POST") return json({ name: "i1" }, 201);
      if (String(url).includes("/api/v1/interactions/")) {
        return json({
          interaction: { id: "i1", interaction_type: "CALL" },
          intents: [],
        });
      }
      return json({
        items: [{ id: "i1", interaction_type: "CALL" }],
        next_cursor: null,
      });
    });
    const { listInteractions, createInteraction, getInteractionDetail } =
      await import("../interaction-intelligence");
    const feed = await listInteractions({ student: "HS-1" }, { limit: 5 });
    expect(feed.items[0]?.id).toBe("i1");
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/students/HS-1/interactions?limit=5",
    );
    const created = await createInteraction({
      student: "HS-1",
      interaction_type: "CALL",
      summary: "Gọi",
    });
    expect(created.name).toBe("i1");
    const detail = await getInteractionDetail("i1");
    expect(detail.interaction.id).toBe("i1");
    expect(
      fetchMock.mock.calls.every((call) =>
        String(call[0]).startsWith("http://api.test/"),
      ),
    ).toBe(true);
  });

  it("fails fast with 501 for contact feeds not served yet", async () => {
    const { listInteractions } = await import("../interaction-intelligence");
    await expect(listInteractions({ contact: "C-1" })).rejects.toMatchObject({
      status: 501,
      code: "FEATURE_NOT_MIGRATED",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
