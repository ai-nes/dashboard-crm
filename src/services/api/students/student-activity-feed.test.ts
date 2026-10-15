import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getStudentActivityRows } from "./student-activity-feed";
const mock = vi.fn();
const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
  vi.stubGlobal("fetch", mock);
  mock.mockReset();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it("prefers canonical records over their linked timeline copy", async () => {
  mock.mockImplementation((url) =>
    String(url).includes("/timeline")
      ? json({
          data: [
            {
              id: "legacy",
              type: "call",
              occurredAt: "2026-10-01T09:00:00Z",
              content: "Legacy copy",
            },
          ],
        })
      : json({
          items: [
            {
              id: "canonical",
              source_id: "legacy",
              channel: "call",
              direction: null,
              outcome: "Captured",
              occurred_at: "2026-10-01T09:00:00Z",
              summary: "Recorded summary",
            },
          ],
          next_cursor: null,
        }),
  );
  const rows = await getStudentActivityRows("S", 100, "INVALID");
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({
    id: "canonical",
    direction: "unknown",
    outcome: "unknown",
    content: "Recorded summary",
  });
});
it("reads the next canonical page instead of losing records after 100", async () => {
  mock.mockImplementation((url) =>
    String(url).includes("/timeline")
      ? json({ data: [] })
      : String(url).includes("cursor=100")
        ? json({
            items: [{ id: "last", occurred_at: "2026-10-01T09:00:00Z" }],
            next_cursor: null,
          })
        : json({
            items: Array.from({ length: 100 }, (_, i) => ({
              id: String(i),
              occurred_at: "2026-10-01T09:00:00Z",
            })),
            next_cursor: "100",
          }),
  );
  expect(await getStudentActivityRows("S", 200, "INVALID")).toHaveLength(101);
  expect(mock).toHaveBeenCalledTimes(3);
});
it("preserves denied canonical reads instead of presenting an empty history", async () => {
  mock.mockImplementation((url) =>
    String(url).includes("/timeline")
      ? json({ data: [] })
      : json({ error: { code: "FORBIDDEN", message: "Denied" } }, 403),
  );
  await expect(
    getStudentActivityRows("S", 100, "INVALID"),
  ).rejects.toMatchObject({ status: 403, code: "FORBIDDEN" });
});
it("deduplicates imported legacy names using their explicit timeline source alias", async () => {
  mock.mockImplementation((url) =>
    String(url).includes("/timeline")
      ? json({
          data: [
            {
              id: "timeline-uuid",
              sourceRecordId: "LEGACY-ZALO-1",
              type: "interaction",
              occurredAt: "2026-10-14T09:00:00Z",
            },
          ],
        })
      : json({
          items: [
            {
              id: "LEGACY-ZALO-1",
              source_id: "HS-OLD",
              interaction_type: "ZALO",
              channel: null,
              direction: null,
              occurred_at: "2026-10-14T09:00:00Z",
              summary: "Recorded exchange",
            },
          ],
        }),
  );
  const rows = await getStudentActivityRows("S", 100, "INVALID");
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({
    id: "LEGACY-ZALO-1",
    channel: "zalo",
    direction: "unknown",
  });
});
