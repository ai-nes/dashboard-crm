import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createInteraction,
  getInteractionCatalog,
  getInteractionDetail,
  getInteractionNpsPoint,
  getNpsHistory,
  getNpsSaleSummary,
  listInteractions,
} from "./index";

const API = "http://localhost:3001";
const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const scoredPoint = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  name: "NPS-1",
  interaction: "INTX-1",
  interaction_datetime: "2026-10-12T02:30:00.000Z",
  source_revision: 1,
  sale: "SALE-1",
  sale_user: "user-1",
  status: "scored",
  satisfaction_score: 8,
  resolution_score: 7,
  friction_score: 9,
  complaint_score: 10,
  total_score: 8.5,
  normalized_score: 83.33,
  confidence: "high",
  ...overrides,
});

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
  vi.stubGlobal("fetch", fetchMock);
});

it("normalizes intents from the canonical CRM interaction response", async () => {
  fetchMock.mockResolvedValue(json({ interaction: {id:'I',interaction_type:'Zalo',occurred_at:'2026-10-14T09:00:00Z'}, intents:[{name:'intent-1',intent_type:'TUITION_CONCERN',intent_role:'parent',notes:'Mẹ cần phương án học phí.',confidence:0.94}] }));
  const result=await getInteractionDetail('I');
  expect(result.intents[0]).toMatchObject({id:'intent-1',semantic_key:'TUITION_CONCERN',role:'parent',notes:'Mẹ cần phương án học phí.',confidence:0.94});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("interaction intelligence API contract", () => {
  it("requires exactly one feed target and sends the contract query names", async () => {
    await expect(
      listInteractions({ student: "STU-1", contact: "CON-1" }),
    ).rejects.toMatchObject({ code: "INVALID_INTERACTION_TARGET" });
    expect(fetchMock).not.toHaveBeenCalled();

    fetchMock.mockResolvedValue(
      json({
        contract_version: "interaction.read:v1",
        items: [
          {
            id: "INTX-1",
            occurred_at: "2026-09-06T02:30:00+00:00",
            interaction_type: "MESSAGE",
            interaction_label: "Tin nhắn",
            channel: "facebook",
            direction: "inbound",
            analysis_state: "intent_bearing",
            source_type: "Note",
            source_id: "NOTE-1",
            has_evidence: true,
          },
        ],
        next_cursor: "cursor-2",
      }),
    );

    const result = await listInteractions(
      { student: "STU-1" },
      {
        channel: "facebook",
        direction: "inbound",
        status: "sealed",
        family: "Conversation",
        search: "webchat inbound",
        interaction_type: "TIN_NHAN_CHATWOOT",
        outcome: "Captured",
        source_type: "Note",
        source_id: "NOTE-1",
        from_date: "2026-09-01",
        to_date: "2026-09-06",
        limit: 120,
      },
    );

    const url = new URL(fetchMock.mock.calls[0]![0]);
    expect(url.pathname).toBe("/api/v1/students/STU-1/interactions");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      channel: "facebook",
      direction: "inbound",
      status: "sealed",
      family: "Conversation",
      search: "webchat inbound",
      interaction_type: "TIN_NHAN_CHATWOOT",
      outcome: "Captured",
      source_type: "Note",
      source_id: "NOTE-1",
      from_date: "2026-09-01",
      to_date: "2026-09-06",
      limit: "100",
    });
    expect(result.items[0]).toMatchObject({
      id: "INTX-1",
      interaction_label: "Tin nhắn",
      source_type: "Note",
      source_id: "NOTE-1",
    });
    expect(result.next_cursor).toBe("cursor-2");
  });

  it("rejects a contact feed that the backend does not serve", async () => {
    await expect(listInteractions({ contact: "CON-1" })).rejects.toMatchObject({
      status: 501,
      code: "FEATURE_NOT_MIGRATED",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a feed without an item list", async () => {
    fetchMock.mockResolvedValue(json({ next_cursor: null }));

    await expect(listInteractions({ student: "STU-1" })).rejects.toMatchObject({
      status: 502,
      code: "INVALID_INTERACTION_FEED_RESPONSE",
    });
  });

  it("keeps detail additive data and does not require intents or score effects", async () => {
    fetchMock.mockResolvedValue(
      json({
        contract_version: "interaction.read:v1",
        interaction: {
          id: "INTX-1",
          interaction_type: "MESSAGE",
          summary: "Tin nhắn đến",
        },
        analysis: {
          state: "no_intent",
          intelligence: {
            summary: "Phụ huynh cần được tư vấn thêm về học phí.",
            conversation_summary: {
              problem: {
                identified: true,
                description: "Cần làm rõ học phí.",
                evidence_refs: [{ name: "EVID-1", actor_role: "parent" }],
              },
            },
          },
        },
        intents: [],
        score_effects: [],
        evidence_refs: [],
      }),
    );

    const result = await getInteractionDetail("INTX-1");

    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/interactions/INTX-1`,
    );
    expect(result.interaction.summary).toBe("Tin nhắn đến");
    expect(
      result.analysis?.intelligence?.conversation_summary?.problem
        .evidence_refs[0],
    ).toEqual(expect.objectContaining({ actor_role: "parent" }));
    expect(result.intents).toEqual([]);
    expect(result.score_effects).toEqual([]);
  });

  it("requires an interaction id for the detail and the NPS point", async () => {
    await expect(getInteractionDetail(" ")).rejects.toMatchObject({
      code: "INVALID_INTERACTION_ID",
    });
    await expect(getInteractionNpsPoint(" ")).rejects.toMatchObject({
      code: "INVALID_INTERACTION_ID",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reads a scored call-quality point from the interaction endpoint", async () => {
    fetchMock.mockResolvedValue(
      json({
        point: {
          ...scoredPoint(),
          student: "STUDENT-1",
          evidence_refs: { transcript: "private evidence" },
          explanation: "private explanation",
        },
      }),
    );

    const result = await getInteractionNpsPoint("INTX-1");

    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/interactions/INTX-1/nps-point`,
    );
    expect(result.point).toMatchObject({
      name: "NPS-1",
      satisfaction_score: 8,
      normalized_score: 83.33,
    });
    expect(result.point).not.toHaveProperty("evidence_refs");
    expect(result.point).not.toHaveProperty("explanation");
    expect(result.point).not.toHaveProperty("student");
  });

  it("preserves an abstained point without turning missing scores into zero", async () => {
    fetchMock.mockResolvedValue(
      json({
        point: {
          name: "NPS-2",
          interaction: "INTX-2",
          interaction_datetime: "2026-10-12T02:30:00.000Z",
          source_revision: 2,
          status: "abstained",
          sale: "SALE-1",
          sale_user: "user-1",
          satisfaction_score: null,
          resolution_score: null,
          friction_score: null,
          complaint_score: null,
          total_score: null,
          normalized_score: null,
          confidence: null,
        },
      }),
    );

    await expect(getInteractionNpsPoint("INTX-2")).resolves.toMatchObject({
      point: {
        status: "abstained",
        total_score: null,
        normalized_score: null,
      },
    });
  });

  it("returns an empty point when the call has no quality result", async () => {
    fetchMock.mockResolvedValue(json({ point: null }));

    await expect(getInteractionNpsPoint("INTX-3")).resolves.toEqual({
      point: null,
    });
  });

  it("rejects a malformed point with 502", async () => {
    fetchMock.mockResolvedValue(json({ point: { name: "NPS-4" } }));

    await expect(getInteractionNpsPoint("INTX-4")).rejects.toMatchObject({
      status: 502,
      code: "INVALID_INTERACTION_NPS_RESPONSE",
    });
  });

  it.each([
    ["missing response envelope", {}],
    ["missing point property", { scope: "own" }],
    ["missing scored criterion", { point: (() => { const point = scoredPoint(); delete point.complaint_score; return point; })() }],
    ["criterion outside the 1–10 scale", { point: scoredPoint({ satisfaction_score: 11 }) }],
    ["total outside the 1–10 scale", { point: scoredPoint({ total_score: 0 }) }],
    ["normalized score outside the 0–100 scale", { point: scoredPoint({ normalized_score: 101 }) }],
    ["invalid datetime", { point: scoredPoint({ interaction_datetime: "yesterday" }) }],
    ["invalid source revision", { point: scoredPoint({ source_revision: 1.5 }) }],
  ])("rejects NPS detail with %s", async (_case, body) => {
    fetchMock.mockResolvedValue(json(body));
    await expect(getInteractionNpsPoint("INTX-4")).rejects.toMatchObject({
      status: 502,
      code: "INVALID_INTERACTION_NPS_RESPONSE",
    });
  });

  it("normalizes a Sale aggregate response and preserves an empty state", async () => {
    fetchMock.mockResolvedValue(
      json({
        records: [
          {
            sale: "SALE-1",
            sale_user: "user-1",
            count: 2,
            average_score: 8.25,
            average_normalized_score: 80.56,
          },
        ],
        total_points: 2,
        average_score: 8.25,
        average_normalized_score: 80.56,
        scope: "own",
        timezone: "Asia/Ho_Chi_Minh",
      }),
    );

    await expect(getNpsSaleSummary({ sale: "SALE-1" })).resolves.toEqual({
      records: [
        {
          sale: "SALE-1",
          sale_user: "user-1",
          count: 2,
          average_score: 8.25,
          average_normalized_score: 80.56,
        },
      ],
      total_points: 2,
      average_score: 8.25,
      average_normalized_score: 80.56,
      scope: "own",
      timezone: "Asia/Ho_Chi_Minh",
    });
    const url = new URL(fetchMock.mock.calls[0]![0]);
    expect(url.pathname).toBe("/api/v1/interactions/nps-summary");
    expect(url.searchParams.get("sale")).toBe("SALE-1");
  });

  it("keeps date filters date-only and validates summary contract instead of inventing zeroes", async () => {
    fetchMock.mockResolvedValue(
      json({
        records: [],
        total_points: 0,
        average_score: null,
        average_normalized_score: null,
        scope: "team",
        timezone: "Asia/Ho_Chi_Minh",
      }),
    );
    await expect(
      getNpsSaleSummary({ from_date: "2026-10-01", to_date: "2026-10-12" }),
    ).resolves.toMatchObject({
      total_points: 0,
      average_score: null,
      scope: "team",
    });
    const url = new URL(fetchMock.mock.calls[0]![0]);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      from_date: "2026-10-01",
      to_date: "2026-10-12",
    });

    fetchMock.mockResolvedValue(json({ records: [{ sale: "SALE-1" }] }));
    await expect(getNpsSaleSummary()).rejects.toMatchObject({
      status: 502,
      code: "INVALID_INTERACTION_NPS_SUMMARY_RESPONSE",
    });
  });

  it("rejects summary records without a stable Sale user id", async () => {
    fetchMock.mockResolvedValue(
      json({
        records: [{ sale: "Same Name", count: 1, average_score: 8, average_normalized_score: 75 }],
        total_points: 1,
        average_score: 8,
        average_normalized_score: 75,
        scope: "team",
        timezone: "Asia/Ho_Chi_Minh",
      }),
    );
    await expect(getNpsSaleSummary()).rejects.toMatchObject({ status: 502 });
  });

  it("requests history with bounded page size and returns safe scored rows and cursor", async () => {
    fetchMock.mockResolvedValue(
      json({
        items: [
          {
            name: "NPS-1",
            interaction: "INTX-1",
            interaction_datetime: "2026-10-12T02:30:00Z",
            source_revision: 3,
            sale: "SALE-1",
            sale_user: "user-1",
            status: "scored",
            satisfaction_score: 8,
            resolution_score: 7,
            friction_score: 9,
            complaint_score: 10,
            total_score: 8.5,
            normalized_score: 83.3,
            confidence: "high",
            transcript: "must not be carried into cache",
          },
        ],
        next_cursor: "cursor-2",
        scope: "team",
        timezone: "Asia/Ho_Chi_Minh",
      }),
    );

    const result = await getNpsHistory({
      from_date: "2026-10-01",
      to_date: "2026-10-12",
      sale: "SALE-1",
      limit: 500,
      cursor: "cursor-1",
    });

    const url = new URL(fetchMock.mock.calls[0]![0]);
    expect(url.pathname).toBe("/api/v1/interactions/nps-history");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      from_date: "2026-10-01",
      to_date: "2026-10-12",
      sale: "SALE-1",
      limit: "100",
      cursor: "cursor-1",
    });
    expect(result.items[0]).not.toHaveProperty("transcript");
    expect(result).toMatchObject({ next_cursor: "cursor-2", scope: "team" });
  });

  it("preserves empty history, rejects malformed items, and keeps backend forbidden errors", async () => {
    fetchMock.mockResolvedValue(
      json({
        items: [],
        next_cursor: null,
        scope: "own",
        timezone: "Asia/Ho_Chi_Minh",
      }),
    );
    await expect(getNpsHistory()).resolves.toMatchObject({
      items: [],
      next_cursor: null,
    });

    fetchMock.mockResolvedValue(
      json({ items: [{ name: "NPS-1" }], next_cursor: null, scope: "own", timezone: "Asia/Ho_Chi_Minh" }),
    );
    await expect(getNpsHistory()).rejects.toMatchObject({
      status: 502,
      code: "INVALID_INTERACTION_NPS_HISTORY_RESPONSE",
    });

    fetchMock.mockResolvedValue(json({ error: { code: "FORBIDDEN", message: "Forbidden" } }, 403));
    await expect(getNpsHistory()).rejects.toMatchObject({ status: 403 });
  });

  it("rejects history rows without a stable Sale user id and filters by that id", async () => {
    fetchMock.mockResolvedValue(
      json({ items: [{ ...scoredPoint(), sale_user: "" }], next_cursor: null, scope: "team", timezone: "Asia/Ho_Chi_Minh" }),
    );
    await expect(getNpsHistory()).rejects.toMatchObject({ status: 502 });

    fetchMock.mockResolvedValue(
      json({ items: [], next_cursor: null, scope: "team", timezone: "Asia/Ho_Chi_Minh" }),
    );
    await getNpsHistory({ sale: "user-2" });
    expect(new URL(fetchMock.mock.calls[1]![0]).searchParams.get("sale")).toBe("user-2");
  });

  it("reads enabled catalogs from reference data in sort order", async () => {
    const row = (code: string, sortOrder: number, enabled = true) => ({
      id: `id-${code}`,
      code,
      displayName: `Tên ${code}`,
      enabled,
      sortOrder,
      description: null,
    });
    fetchMock.mockImplementation(async (url: string) =>
      json({
        data: String(url).includes("interaction-types")
          ? [row("CALL", 2), row("VISIT", 1), row("OLD", 0, false)]
          : [row("TUITION_FEE", 1)],
      }),
    );

    const result = await getInteractionCatalog();

    expect(result.interactionTypes.map((item) => item.code)).toEqual([
      "VISIT",
      "CALL",
    ]);
    expect(result.intentTypes[0]).toMatchObject({
      code: "TUITION_FEE",
      display_name: "Tên TUITION_FEE",
    });
  });

  it("creates a manual interaction for a student", async () => {
    fetchMock.mockResolvedValue(json({ name: "INTX-2026-0001" }, 201));

    await expect(
      createInteraction({
        student: "STU-1",
        interaction_type: "NOTE",
        interaction_datetime: "2026-09-12 10:30:00",
        summary: "Tư vấn học phí",
        notes: "  ",
      }),
    ).resolves.toMatchObject({ name: "INTX-2026-0001" });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/students/STU-1/interactions`);
    expect(init).toMatchObject({ method: "POST", credentials: "include" });
    expect(JSON.parse(init.body)).toEqual({
      interaction_type: "NOTE",
      interaction_datetime: "2026-09-12 10:30:00",
      summary: "Tư vấn học phí",
    });
  });

  it("requires a student and an interaction type before creating", async () => {
    await expect(
      createInteraction({ student: "STU-1", interaction_type: " " }),
    ).rejects.toMatchObject({ code: "INVALID_INTERACTION_INPUT" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves the backend field validation when creating an interaction fails", async () => {
    const details = [
      {
        field: "interaction_datetime",
        code: "invalid",
        message: "Thời gian tương tác không hợp lệ.",
      },
    ];
    fetchMock.mockResolvedValue(
      json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "The request is invalid.",
            details,
            requestId: "interaction-request",
          },
        },
        400,
      ),
    );
    await expect(
      createInteraction({ student: "STU-1", interaction_type: "NOTE" }),
    ).rejects.toMatchObject({ details, requestId: "interaction-request" });
  });

  it("rejects a created interaction without a name with 502", async () => {
    fetchMock.mockResolvedValue(json({}, 201));

    await expect(
      createInteraction({ student: "STU-1", interaction_type: "NOTE" }),
    ).rejects.toMatchObject({
      status: 502,
      code: "INVALID_CREATED_INTERACTION_RESPONSE",
    });
  });
});
