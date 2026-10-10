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

  it("maps need and tag catalogs, including the paged shape", async () => {
    fetchMock.mockImplementation(() =>
      json({ terms: [{ name: "t1" }], total: 1 }),
    );
    await expect(
      call("crm.api.student_classification.list_needs", { status: "" }),
    ).resolves.toEqual([{ name: "t1" }]);
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "http://api.test/api/v1/classification/terms/need?status=all",
    );
    await expect(
      call("crm.api.student_classification.list_tags_page", {
        status: "active",
        group: "G",
        start: 0,
        page_length: 20,
      }),
    ).resolves.toEqual({
      tags: [{ name: "t1" }],
      total: 1,
      start: 0,
      page_length: 20,
    });
  });

  it("maps group and term writes with revisions", async () => {
    fetchMock.mockImplementation(() => json({ ok: true }));
    await call(
      "crm.api.student_classification.create_need_group",
      {},
      { data: { code: "G" } },
    );
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "http://api.test/api/v1/classification/groups/need",
    );
    await call(
      "crm.api.student_classification.transition_tag",
      {},
      {
        name: "t1",
        status: "active",
        expected_revision: 3,
      },
    );
    const [url, init] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(url).toBe(
      "http://api.test/api/v1/classification/terms/tag/t1/transition",
    );
    expect(JSON.parse(init.body as string)).toEqual({
      status: "active",
      expectedRevision: 3,
    });
  });

  it("replaces a student tag with one atomic request", async () => {
    fetchMock.mockImplementation(() => json({ ok: true }));
    const { nestStudentClassificationRequest } =
      await import("./nest-segment-router");
    await nestStudentClassificationRequest(
      "crm.api.student_classification.update_student_tag",
      {
        student: "s1",
        tag: "old",
        new_tag: "new",
        expected_modified: "m1",
      },
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://api.test/api/v1/students/s1/tags/old");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({
      newTagId: "new",
      expectedModified: "m1",
    });
  });
  it("rejects methods without a Nest equivalent", async () => {
    await expect(
      call("crm.api.student_classification.unknown_thing"),
    ).rejects.toMatchObject({ status: 501, code: "NOT_PORTED" });
  });
});
