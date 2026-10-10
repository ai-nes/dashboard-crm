import { describe, expect, it } from "vitest";
import { createCrmQueryClient } from "./crm-query-client";

describe("student audit cache", () => {
  it("invalidates every cached student audit after a successful mutation", async () => {
    const client = createCrmQueryClient();
    const keys = [
      ["student-audit", { student: "student-a" }],
      ["student-audit", { student: "student-b" }],
    ];
    keys.forEach((key) => client.setQueryData(key, { logs: [] }));
    client.setQueryData(["unrelated"], "cached");
    await client
      .getMutationCache()
      .build(client, { mutationFn: async () => "saved" })
      .execute(undefined);
    keys.forEach((key) =>
      expect(client.getQueryState(key)?.isInvalidated).toBe(true),
    );
    expect(client.getQueryState(["unrelated"])?.isInvalidated).toBe(false);
    client.clear();
  });

  it("keeps audit data valid when a mutation fails", async () => {
    const client = createCrmQueryClient();
    const key = ["student-audit", { student: "student-a" }];
    client.setQueryData(key, { logs: [] });
    await expect(
      client
        .getMutationCache()
        .build(client, {
          mutationFn: async () => {
            throw new Error("rejected");
          },
        })
        .execute(undefined),
    ).rejects.toThrow("rejected");
    expect(client.getQueryState(key)?.isInvalidated).toBe(false);
    client.clear();
  });
});
