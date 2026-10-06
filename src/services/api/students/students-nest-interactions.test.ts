import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("student interactions with the Nest backend", () => {
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

    const { getStudentInteractions } = await import("./index");
    await expect(getStudentInteractions("student-1")).rejects.toMatchObject({
      status: 502,
      code: "INVALID_INTERACTIONS_RESPONSE",
    });
  });
});
