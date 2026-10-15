import { NestApiError, nestRequest } from "../nest/nest-client";

type Row = Record<string, unknown>;
const text = (value: unknown) => (typeof value === "string" ? value : "");
const key = (value: unknown) =>
  text(value).trim().toLowerCase().replace(/[ _]+/g, "-");

/** Merge recorded interactions with legacy timeline entries without writing duplicate history. */
export async function getStudentActivityRows(
  studentId: string,
  limit: number,
  errorCode: string,
): Promise<Row[]> {
  const base = `/api/v1/students/${encodeURIComponent(studentId)}`;
  const [timeline, feed] = await Promise.all([
    nestRequest<{ data?: Row[] }>(`${base}/timeline`, { query: { limit } }),
    nestRequest<{ items?: Row[]; next_cursor?: string | null }>(
      `${base}/interactions`,
      { query: { limit: Math.min(limit, 100) } },
    ),
  ]);
  const invalid = () =>
    new NestApiError(
      502,
      errorCode,
      "Phản hồi lịch sử tương tác không hợp lệ.",
    );
  if (!Array.isArray(timeline?.data) || !Array.isArray(feed?.items))
    throw invalid();
  const canonical = [...feed.items];
  let cursor = feed.next_cursor;
  const seen = new Set<string>();
  while (cursor && canonical.length < limit) {
    if (seen.has(cursor)) throw invalid();
    seen.add(cursor);
    const next = await nestRequest<{
      items?: Row[];
      next_cursor?: string | null;
    }>(`${base}/interactions`, {
      query: { limit: Math.min(limit - canonical.length, 100), cursor },
    });
    if (!Array.isArray(next.items)) throw invalid();
    canonical.push(...next.items);
    cursor = next.next_cursor;
  }
  const result: Row[] = [];
  const consumed = new Set<unknown>();
  for (const row of canonical) {
    const channel = key(row.channel),
      type = key(row.interaction_type);
    const isCall =
      ["call", "phone"].includes(channel) ||
      ["call", "phone-call", "connected", "counseling"].includes(type);
    const legacy = timeline.data.find(
      (t) =>
        t.id === row.id ||
        t.id === row.source_id ||
        t.sourceRecordId === row.id,
    );
    if (legacy) consumed.add(legacy.id);
    const outcome = key(row.outcome);
    result.push({
      ...legacy,
      id: text(row.id),
      type: isCall ? "call" : "interaction",
      occurredAt: text(row.occurred_at),
      title: text(row.interaction_label) || text(row.interaction_type),
      content: text(row.summary) || legacy?.content || "",
      channel:
        text(row.channel) ||
        ([
          "zalo",
          "zalo-chat",
          "message-chatwoot",
          "tin-nhan-chatwoot",
        ].includes(type)
          ? "zalo"
          : ""),
      interactionType: text(row.interaction_type),
      direction: ["inbound", "outbound", "missed"].includes(key(row.direction))
        ? key(row.direction)
        : "unknown",
      outcome:
        isCall &&
        !["connected", "missed", "no-answer", "callback"].includes(outcome)
          ? "unknown"
          : outcome,
      sourceNamespace: "nest.interaction",
      interactionId: text(row.id),
    });
  }
  result.push(...timeline.data.filter((row) => !consumed.has(row.id)));
  return result
    .sort((a, b) => text(b.occurredAt).localeCompare(text(a.occurredAt)))
    .slice(0, limit);
}
