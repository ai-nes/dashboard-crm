import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createInteraction,
  getInteractionCatalog,
  getInteractionDetail,
  getInteractionNpsPoint,
  getNpsSaleSummary,
  listInteractions,
} from "./index";

const API = "http://localhost:3001";
const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
  vi.stubGlobal("fetch", fetchMock);
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
          name: "NPS-1",
          interaction: "INTX-1",
          status: "scored",
          satisfaction_score: 8,
          resolution_score: 7,
          friction_score: 9,
          complaint_score: 10,
          total_score: 8.5,
          normalized_score: 83.33,
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
  });

  it("preserves an abstained point without turning missing scores into zero", async () => {
    fetchMock.mockResolvedValue(
      json({
        point: {
          name: "NPS-2",
          interaction: "INTX-2",
          status: "abstained",
          terminal_reason: "agent_identity_unmapped",
        },
      }),
    );

    await expect(getInteractionNpsPoint("INTX-2")).resolves.toMatchObject({
      point: {
        status: "abstained",
        terminal_reason: "agent_identity_unmapped",
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

  it("normalizes a Sale aggregate response and preserves an empty state", async () => {
    fetchMock.mockResolvedValue(
      json({
        records: [
          {
            sale: "SALE-1",
            count: 2,
            average_score: 8.25,
            average_normalized_score: 80.56,
          },
        ],
        total_points: 2,
      }),
    );

    await expect(getNpsSaleSummary({ sale: "SALE-1" })).resolves.toEqual({
      records: [
        {
          sale: "SALE-1",
          sale_user: null,
          count: 2,
          average_score: 8.25,
          average_normalized_score: 80.56,
        },
      ],
      total_points: 2,
    });
    const url = new URL(fetchMock.mock.calls[0]![0]);
    expect(url.pathname).toBe("/api/v1/interactions/nps-summary");
    expect(url.searchParams.get("sale")).toBe("SALE-1");
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
