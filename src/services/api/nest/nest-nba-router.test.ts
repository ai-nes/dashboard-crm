import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { nestNbaHandler } from "./nest-nba-router";
import { operationCaller } from "./nest-test-support";

const fetchMock = vi.fn();
const OPS = "http://ops.test/api/method";

function json(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("next-best-action catalog routed to Nest", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    fetchMock.mockImplementation(() => json({ total: 0, actions: [] }));
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("lists and updates actions through the nba endpoints", async () => {
    const request = operationCaller(nestNbaHandler);
    await request(`${OPS}/crm.api.action.list_actions?search=a&page_length=5`);
    await request(`${OPS}/crm.api.action.update_action`, {
      method: "POST",
      body: JSON.stringify({ name: "ADD_TAG", enabled: 0 }),
    });
    const [list, update] = fetchMock.mock.calls as [string, RequestInit][];
    expect(String(list[0])).toBe(
      "http://api.test/api/v1/nba/actions?search=a&page_length=5",
    );
    expect(String(update[0])).toBe(
      "http://api.test/api/v1/nba/actions/ADD_TAG",
    );
    expect(update[1].method).toBe("PATCH");
    expect(JSON.parse(update[1].body as string)).toEqual({ enabled: 0 });
  });

  it("leaves timing policies to the dedicated endpoints", async () => {
    const { nestNbaHandler } = await import("./nest-nba-router");
    const { NOT_HANDLED } = await import("./nest-handler");
    await expect(
      nestNbaHandler(
        "crm.api.timing_policy.list_timing_policies",
        {},
        undefined,
      ),
    ).resolves.toBe(NOT_HANDLED);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("serves the recommendation queue and decisions through the nba endpoints", async () => {
    const request = operationCaller(nestNbaHandler);
    await request(
      `${OPS}/crm.api.student_worklist.list_student_worklist?student_id=HS-1&page_size=50`,
    );
    await request(`${OPS}/crm.api.student_decision.decide_recommendation`, {
      method: "POST",
      body: JSON.stringify({ name: "C1", operation: "ACCEPT" }),
    });
    const [list, decide] = fetchMock.mock.calls as [string, RequestInit][];
    expect(String(list[0])).toBe(
      "http://api.test/api/v1/nba/worklist?student_id=HS-1&page_size=50",
    );
    expect(String(decide[0])).toBe("http://api.test/api/v1/nba/decisions");
    expect(JSON.parse(String(decide[1].body))).toMatchObject({
      name: "C1",
      operation: "ACCEPT",
    });
  });
});
