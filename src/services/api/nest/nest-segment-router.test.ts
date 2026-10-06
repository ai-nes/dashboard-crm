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

async function call(
  method: string,
  query: Record<string, string | number | undefined> = {},
  body?: Record<string, unknown>,
) {
  const { nestSegmentRequest } = await import("./nest-segment-router");
  return nestSegmentRequest<unknown>(method, query, body);
}

describe("nestSegmentRequest", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    fetchMock.mockImplementation(() =>
      json({ segments: [{ name: "s1" }], total: 1 }),
    );
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns the bare list for list_segments and the page for the paged call", async () => {
    await expect(
      call("crm.api.student_segment.list_segments", { status: "active" }),
    ).resolves.toEqual([{ name: "s1" }]);
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "http://api.test/api/v1/segments?status=active",
    );
    await expect(
      call("crm.api.student_segment.list_segments_page", {}),
    ).resolves.toMatchObject({ total: 1 });
  });

  it("sends draft rules for preview as a parsed JSON body", async () => {
    await call("crm.api.student_segment.preview_segment", {
      filters: JSON.stringify({ groups: [] }),
      start: 0,
      page_length: 25,
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://api.test/api/v1/segments/preview");
    expect(JSON.parse(init.body as string)).toEqual({
      filters: { groups: [] },
      start: 0,
      pageLength: 25,
    });
  });

  it("maps update, transition and delete with the revision", async () => {
    await call(
      "crm.api.student_segment.update_segment",
      {},
      {
        name: "s1",
        data: { title: "T" },
        expected_revision: 2,
      },
    );
    expect(
      JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string),
    ).toEqual({
      expectedRevision: 2,
      data: { title: "T" },
    });
    await call(
      "crm.api.student_segment.transition_segment",
      {},
      {
        name: "s1",
        status: "active",
        expected_revision: 3,
      },
    );
    expect(String(fetchMock.mock.calls[1][0])).toBe(
      "http://api.test/api/v1/segments/s1/transition",
    );
    await call(
      "crm.api.student_segment.delete_segment",
      {},
      {
        name: "s1",
        expected_revision: 4,
      },
    );
    const [url, init] = fetchMock.mock.calls[2] as [string, RequestInit];
    expect(url).toBe("http://api.test/api/v1/segments/s1?expectedRevision=4");
    expect(init.method).toBe("DELETE");
  });

  it("returns empty term lists and refuses classification management", async () => {
    await expect(
      call("crm.api.student_classification.list_needs"),
    ).resolves.toEqual([]);
    await expect(
      call("crm.api.student_classification.create_need_group", {}, {}),
    ).rejects.toMatchObject({ status: 501, code: "NOT_PORTED" });
  });
});
