import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createInteraction,
  getInteractionCatalog,
  getInteractionDetail,
  getInteractionEvidence,
  listInteractions,
} from "./index";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("interaction intelligence API contract", () => {
  it("requires exactly one feed target and sends the contract query names", async () => {
    await expect(
      listInteractions({ student: "STU-1", contact: "CON-1" }),
    ).rejects.toMatchObject({
      code: "INVALID_INTERACTION_TARGET",
    });

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
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
                source_type: "FCRM Note",
                source_id: "NOTE-1",
                has_evidence: true,
              },
            ],
            next_cursor: "cursor-2",
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

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
        source_type: "FCRM Note",
        source_id: "NOTE-1",
        from_date: "2026-09-01",
        to_date: "2026-09-06",
        limit: 120,
      },
      { baseUrl: "http://frappe.test" },
    );

    const url = String(fetchMock.mock.calls[0]?.[0]);
    expect(url).toContain("student=STU-1");
    expect(url).toContain("channel=facebook");
    expect(url).toContain("direction=inbound");
    expect(url).toContain("status=sealed");
    expect(url).toContain("family=Conversation");
    expect(url).toContain("search=webchat+inbound");
    expect(url).toContain("interaction_type=TIN_NHAN_CHATWOOT");
    expect(url).toContain("outcome=Captured");
    expect(url).toContain("source_type=FCRM+Note");
    expect(url).toContain("source_id=NOTE-1");
    expect(url).toContain("limit=100");
    expect(result.items[0]).toMatchObject({
      id: "INTX-1",
      interaction_label: "Tin nhắn",
      source_type: "FCRM Note",
      source_id: "NOTE-1",
    });
    expect(result.next_cursor).toBe("cursor-2");
  });

  it("keeps detail additive data and does not require intents or score effects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            contract_version: "interaction.read:v1",
            interaction: {
              id: "INTX-1",
              interaction_type: "MESSAGE",
              summary: "Tin nhắn đến",
            },
            intents: [],
            score_effects: [],
            evidence_refs: [],
          }),
          { status: 200 },
        ),
      ),
    );

    const result = await getInteractionDetail("INTX-1", {
      baseUrl: "http://frappe.test",
    });
    expect(result.interaction.summary).toBe("Tin nhắn đến");
    expect(result.intents).toEqual([]);
    expect(result.score_effects).toEqual([]);
  });

  it("requests evidence content only after the explicit include-content action", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "EVID-1",
          content: null,
          content_redacted: true,
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await getInteractionEvidence("EVID-1", true, {
      baseUrl: "http://frappe.test",
    });
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("include_content=1");
  });

  it("reads enabled catalogs through the generic Frappe list API", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: [
              {
                name: "MESSAGE",
                code: "MESSAGE",
                display_name: "Tin nhắn",
                enabled: 1,
                sort_order: 20,
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: [
              {
                name: "TUITION_FEE",
                code: "TUITION_FEE",
                display_name: "Học phí",
                importance: "High",
                enabled: 1,
                sort_order: 30,
              },
            ],
          }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await getInteractionCatalog({
      baseUrl: "http://frappe.test",
    });
    expect(result.interactionTypes[0]).toMatchObject({
      code: "MESSAGE",
      display_name: "Tin nhắn",
    });
    expect(result.intentTypes[0]).toMatchObject({
      code: "TUITION_FEE",
      display_name: "Học phí",
      importance: "High",
    });
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      "doctype=CRM+Interaction+Type",
    );
  });

  it("creates a manual interaction without a reference document", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: { name: "INTX-2026-0001" } }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await createInteraction(
      {
        student: "STU-1",
        interaction_type: "NOTE",
        interaction_datetime: "2026-09-12 10:30:00",
        summary: "Tư vấn học phí",
      },
      { baseUrl: "http://frappe.test" },
    );

    const [url, request] = fetchMock.mock.calls[0] ?? [];
    const body = JSON.parse(String((request as RequestInit)?.body));
    expect(url).toBe("http://frappe.test/api/method/frappe.client.insert");
    expect(request).toMatchObject({ method: "POST" });
    expect(body.doc).toMatchObject({
      doctype: "CRM Interaction",
      student: "STU-1",
      interaction_type: "NOTE",
      interaction_datetime: "2026-09-12 10:30:00",
      summary: "Tư vấn học phí",
    });
    expect(body.doc).not.toHaveProperty("reference_doctype");
    expect(body.doc).not.toHaveProperty("reference_docname");
  });

  it("sends the browser CSRF token for manual interaction writes", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: { name: "INTX-2026-0002" } }), {
        status: 200,
      }),
    );
    vi.stubGlobal("window", {});
    vi.stubGlobal("document", { cookie: "csrf_token=csrf%2Ftoken" });
    vi.stubGlobal("fetch", fetchMock);

    await createInteraction(
      { student: "STU-1", interaction_type: "NOTE" },
      { baseUrl: "http://frappe.test" },
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: "POST",
      headers: expect.objectContaining({
        "X-Frappe-CSRF-Token": "csrf/token",
      }),
    });
  });

  it("falls back to the session endpoint when the CSRF cookie is unavailable", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ message: { csrf_token: "session-csrf-token" } }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: { name: "INTX-2026-0003" } }), {
          status: 200,
        }),
      );
    vi.stubGlobal("window", {});
    vi.stubGlobal("document", { cookie: "" });
    vi.stubGlobal("fetch", fetchMock);

    await createInteraction(
      { student: "STU-1", interaction_type: "NOTE" },
      { baseUrl: "http://frappe.test" },
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "http://frappe.test/api/method/crm.api.session.me",
    );
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({
      method: "POST",
      headers: expect.objectContaining({
        "X-Frappe-CSRF-Token": "session-csrf-token",
      }),
    });
  });
});
