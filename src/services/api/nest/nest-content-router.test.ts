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

async function call(method: string, options: Record<string, unknown> = {}) {
  const { nestContentRequest } = await import("./nest-content-router");
  return nestContentRequest<unknown>(method, options);
}

describe("nestContentRequest", () => {
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

  it("maps template reads and unwraps the single-template envelope", async () => {
    fetchMock.mockImplementation(() => json({ template: { id: "t1" } }));
    await expect(
      call("crm.api.message_templates.get_message_template", {
        query: { name: "t 1" },
      }),
    ).resolves.toEqual({ id: "t1" });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "http://api.test/api/v1/message-templates/t%201",
    );
  });

  it("sends updates as PATCH with the expected modification time", async () => {
    fetchMock.mockImplementation(() => json({ template: { id: "t1" } }));
    await call("crm.api.message_templates.update_message_template", {
      body: {
        name: "t1",
        data: { name: "New", subject: "s", body: "b" },
        expected_modified: "2026-01-01T00:00:00.000Z",
      },
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://api.test/api/v1/message-templates/t1");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({
      name: "New",
      subject: "s",
      body: "b",
      expectedModified: "2026-01-01T00:00:00.000Z",
    });
  });

  it("maps preview and delete calls to the dashboard contract", async () => {
    fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
      init?.method === "DELETE"
        ? json({ deleted: "s1" })
        : json({ subject: "x" }),
    );
    await call("crm.api.message_templates.preview_message_template", {
      body: { lead_id: "lead-1", data: { subject: "a", body: "b" } },
    });
    expect(
      JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string),
    ).toEqual({
      recordId: "lead-1",
      context: "lead",
      data: { subject: "a", body: "b" },
    });
    await expect(
      call("crm.api.snippets.delete_snippet", { body: { name: "s1" } }),
    ).resolves.toEqual({ name: "s1", deleted: true });
  });

  it("rejects methods that have no Nest equivalent", async () => {
    await expect(call("crm.api.unknown.thing")).rejects.toMatchObject({
      status: 501,
      code: "NOT_PORTED",
    });
  });
});
