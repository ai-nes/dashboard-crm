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

describe("lead assignment batch Nest transport", () => {
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

  it("maps list and detail envelopes to the existing batch contract", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.includes("/lead-assignment-batches/batch-1")) {
        return json({
          data: {
            batch: {
              id: "batch-1",
              batchName: "Batch 1",
              status: "ready",
              itemCount: 1,
            },
            items: [
              {
                id: "item-1",
                leadId: "lead-1",
                studentName: "A",
                status: "pending",
              },
            ],
            pagination: {
              page: 1,
              pageSize: 20,
              total: 1,
              totalPages: 1,
              hasNextPage: false,
            },
          },
        });
      }
      return json({
        data: {
          items: [
            {
              id: "batch-1",
              batchName: "Batch 1",
              status: "ready",
              itemCount: 1,
            },
          ],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
          },
        },
      });
    });

    const api = await import("./lead-assignment-batch");
    await expect(api.listLeadAssignmentBatches()).resolves.toMatchObject({
      items: [{ id: "batch-1", batchName: "Batch 1" }],
    });
    await expect(api.getLeadAssignmentBatch("batch-1")).resolves.toMatchObject({
      batch: { id: "batch-1", status: "ready" },
      items: [{ leadId: "lead-1", status: "pending" }],
    });
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://api.test/api/v1/lead-assignment-batches?page=1&pageSize=20",
      "http://api.test/api/v1/lead-assignment-batches/batch-1",
    ]);
  });

  it("sends a Nest run request with browser credentials", async () => {
    fetchMock.mockResolvedValue(
      json({
        data: {
          batch: {
            id: "batch-1",
            batchName: "Batch 1",
            status: "completed",
            itemCount: 0,
          },
          items: [],
        },
      }),
    );
    const api = await import("./lead-assignment-batch");
    await api.runLeadAssignmentBatch({ batchId: "batch-1" });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "http://api.test/api/v1/lead-assignment-batches/batch-1/run",
    );
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
  });
});
