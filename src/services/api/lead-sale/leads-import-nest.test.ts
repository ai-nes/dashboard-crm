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

describe("lead import with the Nest backend", () => {
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

  const file = () =>
    new File(["a,b\n1,2\n"], "leads.csv", { type: "text/csv" });

  it("uploads the file as multipart and normalizes the inspection", async () => {
    fetchMock.mockImplementation(() =>
      json({
        filename: "leads.csv",
        fieldCatalog: [
          { key: "phone", label: "Di động", required: true, valueType: "text" },
        ],
        headers: [
          {
            sourceIndex: 0,
            label: "Phone",
            inferredField: "phone",
            enabled: true,
          },
        ],
        sampleRows: [{ row: 2, values: ["0901234567"] }],
        requiredFields: ["phone"],
      }),
    );
    const { inspectLeadImport } = await import("./leads");
    const result = await inspectLeadImport(file());
    expect(result.headers[0]).toMatchObject({ inferredField: "phone" });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://api.test/api/v1/leads/import/inspect");
    expect(init.body).toBeInstanceOf(FormData);
    expect(
      (init.headers as Record<string, string>)["Content-Type"],
    ).toBeUndefined();
  });

  it("sends campaign and mapping with the preview and import", async () => {
    fetchMock.mockImplementation(() =>
      json({
        filename: "leads.csv",
        total: 1,
        created: 1,
        failed: 0,
        students: [{ name: "id-1", lead_code: "LD-1", row: 2 }],
        errors: [],
      }),
    );
    const { importLeadFile } = await import("./leads");
    const mapping = [{ sourceIndex: 0, targetField: "phone", enabled: true }];
    const result = await importLeadFile(file(), "CAMP", mapping);
    expect(result).toMatchObject({ total: 1, created: 1, failed: 0 });
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const form = init.body as FormData;
    expect(form.get("campaign_code")).toBe("CAMP");
    expect(JSON.parse(form.get("column_mapping") as string)).toEqual(mapping);
  });

  it("posts parsed rows as JSON and surfaces backend errors", async () => {
    fetchMock.mockImplementationOnce(() =>
      json({
        filename: "rows",
        total: 1,
        created: 1,
        failed: 0,
        students: [],
        errors: [],
      }),
    );
    const { importLeadRows } = await import("./leads");
    await importLeadRows([{ student_name: "An" }], "rows", "CAMP");
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(init.body as string)).toEqual({
      rows: [{ student_name: "An" }],
      filename: "rows",
      campaign_code: "CAMP",
    });

    fetchMock.mockImplementationOnce(() =>
      json({ error: { code: "CAMPAIGN_NOT_OPEN", message: "Đóng." } }, 400),
    );
    await expect(
      importLeadRows([{ student_name: "An" }], "rows", "CAMP"),
    ).rejects.toMatchObject({ status: 400, code: "CAMPAIGN_NOT_OPEN" });
  });
});
