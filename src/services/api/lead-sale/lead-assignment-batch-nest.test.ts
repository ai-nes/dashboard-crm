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

  it.each([undefined, "all"] as const)(
    "omits the UI-only history status %s from the Nest query",
    async (status) => {
      fetchMock.mockImplementation((url: string) => {
        if (new URL(url).searchParams.has("status")) {
          return json(
            {
              error: {
                code: "INVALID_INPUT",
                message: "The request is invalid.",
              },
            },
            400,
          );
        }
        return json({
          data: { items: [], pagination: { page: 1, pageSize: 50, total: 0 } },
        });
      });
      const api = await import("./lead-assignment-batch");
      await expect(
        api.listLeadAssignmentHistoryItems({ status }),
      ).resolves.toMatchObject({ items: [] });
      expect(fetchMock.mock.calls[0]?.[0]).toBe(
        "http://api.test/api/v1/lead-assignment-batches/history?page=1&limit=50",
      );
    },
  );

  it.each(["assigned", "issues", "manual_review"] as const)(
    "preserves the history status filter %s and pagination",
    async (status) => {
      fetchMock.mockResolvedValue(
        json({
          data: {
            items: [],
            pagination: {
              page: 2,
              pageSize: 10,
              total: 25,
              totalPages: 3,
              hasNextPage: true,
            },
          },
        }),
      );
      const api = await import("./lead-assignment-batch");
      await expect(
        api.listLeadAssignmentHistoryItems({
          status,
          page: 2,
          limit: 10,
          q: " Lead ",
          leadIds: ["lead-1", "lead-2"],
        }),
      ).resolves.toMatchObject({
        pagination: { page: 2, total: 25, hasNextPage: true },
      });
      const query = new URL(fetchMock.mock.calls[0][0]).searchParams;
      expect(Object.fromEntries(query)).toEqual({
        page: "2",
        limit: "10",
        status,
        q: "Lead",
        leadIds: "lead-1,lead-2",
      });
    },
  );

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
