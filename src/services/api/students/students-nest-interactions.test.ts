import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function withEmptyCanonicalFeed() {
  const mock = vi.mocked(fetch);
  const timeline = mock.getMockImplementation()!;
  mock.mockImplementation((url, init) =>
    String(url).includes("/interactions")
      ? Promise.resolve(
          new Response(JSON.stringify({ items: [], next_cursor: null })),
        )
      : Promise.resolve(timeline(url, init)).then((response) =>
          response.clone(),
        ),
  );
}

describe("student interactions with the Nest backend", () => {
  it("shows Zalo records with unknown direction using the recorded interaction type", async () => {
    vi.mocked(fetch).mockImplementation(
      async (url) =>
        new Response(
          JSON.stringify(
            String(url).includes("/timeline")
              ? { data: [] }
              : {
                  items: [
                    {
                      id: "zalo-unknown",
                      interaction_type: "ZALO",
                      channel: null,
                      direction: null,
                      occurred_at: "2026-10-14T09:00:00Z",
                      summary: "Recorded summary",
                    },
                  ],
                  next_cursor: null,
                },
          ),
        ),
    );
    const api = await import("./index");
    const result = await api.getStudentChatwootInteractions("S");
    expect(result?.zalo_messages).toEqual([
      expect.objectContaining({
        id: "zalo-unknown",
        direction: "unknown",
        senderName: "Chưa ghi nhận",
        content: "Recorded summary",
      }),
    ]);
  });
  it("includes canonical calls and Zalo records even without timeline copies", async () => {
    vi.mocked(fetch).mockImplementation(
      async (url) =>
        new Response(
          JSON.stringify(
            String(url).includes("/timeline")
              ? { data: [] }
              : {
                  items: [
                    {
                      id: "canonical-call",
                      interaction_type: "Call",
                      channel: "call",
                      direction: "outbound",
                      outcome: "Connected",
                      occurred_at: "2026-10-01T09:00:00Z",
                      summary: "Đã tư vấn ngành học.",
                    },
                    {
                      id: "canonical-zalo",
                      interaction_type: "Zalo",
                      channel: "zalo",
                      direction: "inbound",
                      outcome: "Replied",
                      occurred_at: "2026-10-02T09:00:00Z",
                      summary: "Em hỏi về học phí.",
                    },
                  ],
                  next_cursor: null,
                },
          ),
        ),
    );
    const api = await import("./index");
    expect((await api.getStudentInteractions("student-1"))?.calls).toEqual([
      expect.objectContaining({
        id: "canonical-call",
        outcome: "connected",
        summary: "Đã tư vấn ngành học.",
      }),
    ]);
    const messages = (await api.getStudentChatwootInteractions("student-1"))
      ?.zalo_messages;
    expect(messages).toEqual([
      expect.objectContaining({
        id: "canonical-zalo",
        content: "Em hỏi về học phí.",
        direction: "inbound",
      }),
    ]);
    expect(messages?.[0].status).toBeUndefined();
  });
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("maps call entries from the student timeline", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: "call-1",
              type: "call",
              occurredAt: "2026-10-07T10:00:00.000Z",
              title: "Tư vấn học phí",
              content: "Đã gửi bảng học phí.",
              direction: "outbound",
              outcome: "connected",
              durationSec: 180,
              author: "Sale One",
              channel: "phone",
            },
            {
              id: "note-1",
              type: "note",
              occurredAt: "2026-10-07T09:00:00.000Z",
            },
          ],
          meta: { total: 2 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    withEmptyCanonicalFeed();
    const { getStudentInteractions } = await import("./index");
    await expect(getStudentInteractions("student-1")).resolves.toEqual({
      student_id: "student-1",
      zalo_messages: [],
      calls: [
        expect.objectContaining({
          id: "call-1",
          time: "2026-10-07T10:00:00.000Z",
          direction: "outbound",
          outcome: "connected",
          callerName: "Tư vấn viên",
          receiverName: "Học sinh",
          topic: "Tư vấn học phí",
          summary: "Đã gửi bảng học phí.",
          durationSeconds: 180,
          summaryStatus: "COMPLETED",
        }),
      ],
      total_interactions: 1,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/api/v1/students/student-1/timeline?limit=100",
      expect.objectContaining({ credentials: "include", cache: "no-store" }),
    );
  });

  it("rejects an invalid Nest timeline envelope", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: null }), { status: 200 }),
    );

    withEmptyCanonicalFeed();
    const { getStudentInteractions } = await import("./index");
    await expect(getStudentInteractions("student-1")).rejects.toMatchObject({
      status: 502,
      code: "INVALID_INTERACTIONS_RESPONSE",
    });
  });
});
