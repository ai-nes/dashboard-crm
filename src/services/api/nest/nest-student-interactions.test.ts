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

describe("student interactions with the Nest backend", () => {
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

  it("maps timeline interactions to the Chatwoot-compatible response", async () => {
    fetchMock.mockImplementation(() =>
      json({
        data: [
          {
            id: "interaction-1",
            type: "interaction",
            occurredAt: "2026-10-07T05:00:00.000Z",
            author: "Sale A",
            title: "Tư vấn qua Zalo",
            content: "Đã gửi thông tin ngành học.",
            channel: "Zalo",
            direction: "outbound",
            outcome: "connected",
          },
          {
            id: "note-1",
            type: "note",
            occurredAt: "2026-10-07T04:00:00.000Z",
          },
        ],
        meta: { total: 2 },
      }),
    );

    const api = await import("../students");
    const result = await api.getStudentChatwootInteractions("student-1");

    expect(result).toMatchObject({
      student_id: "student-1",
      meta: { page: 1, page_size: 50, total: 1, has_next_page: false },
    });
    expect(result?.data).toEqual([
      expect.objectContaining({
        name: "interaction-1",
        interaction_type: "Zalo",
        summary: "Tư vấn qua Zalo",
        notes: "Đã gửi thông tin ngành học.",
        direction: "outbound",
        source_namespace: "nest.timeline",
      }),
    ]);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/v1/students/student-1/timeline?limit=200",
    );
  });
});
