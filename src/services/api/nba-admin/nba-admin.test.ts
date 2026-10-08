import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAdminActionType,
  createTimingPolicy,
  deleteAdminActionType,
  deleteTimingPolicy,
  listAdminActionTypes,
  listTimingPolicies,
  updateAdminActionType,
  updateTimingPolicy,
} from "./index";
import { normalizeTimingPolicy } from "./normalizers";

const API = "http://localhost:3001";
const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const policyRow = {
  name: "FOLLOW_UP_24H",
  policy_key: "FOLLOW_UP_24H",
  trigger_type: "relative",
  delay_value: 24,
  delay_unit: "hours",
  time_slot: "6-12",
  recurrence_type: "none",
  optimization_enabled: false,
  modified: "2026-10-08T10:00:00.000Z",
};

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("NBA admin timing policies", () => {
  it("normalizes timing policy fields", () => {
    expect(normalizeTimingPolicy(policyRow)).toMatchObject({
      name: "FOLLOW_UP_24H",
      policyKey: "FOLLOW_UP_24H",
      triggerType: "relative",
      delayValue: 24,
      timeSlot: "6-12",
      optimizationEnabled: false,
      modified: "2026-10-08T10:00:00.000Z",
    });
  });

  it("lists policies with the trigger filter and paging", async () => {
    fetchMock.mockResolvedValue(
      json({ policies: [policyRow], total: 1, start: 0, page_length: 20 }),
    );

    const result = await listTimingPolicies({
      triggerType: "relative",
      search: "follow",
    });

    const url = new URL(fetchMock.mock.calls[0]![0]);
    expect(url.pathname).toBe("/api/v1/nba/timing-policies");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      search: "follow",
      trigger_type: "relative",
      start: "0",
      page_length: "20",
    });
    expect(result.total).toBe(1);
    expect(result.policies[0]).toMatchObject({ policyKey: "FOLLOW_UP_24H" });
  });

  it("does not filter on the all option", async () => {
    fetchMock.mockResolvedValue(json({ policies: [], total: 0 }));

    await listTimingPolicies({ triggerType: "all" });

    expect(
      new URL(fetchMock.mock.calls[0]![0]).searchParams.has("trigger_type"),
    ).toBe(false);
  });

  it("creates a policy and stores cleared text as null", async () => {
    fetchMock.mockResolvedValue(json(policyRow, 201));

    await createTimingPolicy({
      policyKey: "FOLLOW_UP_24H",
      triggerType: "relative",
      triggerEvent: "",
      delayValue: 24,
      delayUnit: "hours",
      timeSlot: "6-12",
      allowedStartTime: "",
      allowedEndTime: "",
      optimizationEnabled: false,
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/nba/timing-policies`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      policy_key: "FOLLOW_UP_24H",
      trigger_type: "relative",
      trigger_event: null,
      delay_value: 24,
      delay_unit: "hours",
      time_slot: "6-12",
      allowed_start_time: null,
      allowed_end_time: null,
      optimization_enabled: false,
    });
  });

  it("updates a policy with the version it was loaded at", async () => {
    fetchMock.mockResolvedValue(json(policyRow));

    await updateTimingPolicy(
      "FOLLOW_UP_24H",
      { policyKey: "IGNORED", triggerType: "relative", delayValue: 48 },
      "2026-10-08T10:00:00.000Z",
    );

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/nba/timing-policies/FOLLOW_UP_24H`);
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({
      trigger_type: "relative",
      delay_value: 48,
      expectedModified: "2026-10-08T10:00:00.000Z",
    });
  });

  it("refuses to update or delete without a version", async () => {
    await expect(
      updateTimingPolicy("FOLLOW_UP_24H", { triggerType: "relative" }, null),
    ).rejects.toMatchObject({ status: 400, code: "INVALID_MODIFIED" });
    await expect(deleteTimingPolicy("FOLLOW_UP_24H", "")).rejects.toMatchObject(
      { status: 400, code: "INVALID_MODIFIED" },
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("deletes a policy with the version it was loaded at", async () => {
    fetchMock.mockResolvedValue(json({ deleted: "FOLLOW_UP_24H" }));

    await deleteTimingPolicy("FOLLOW_UP_24H", "2026-10-08T10:00:00.000Z");

    const [url, init] = fetchMock.mock.calls[0]!;
    const parsed = new URL(url);
    expect(parsed.pathname).toBe("/api/v1/nba/timing-policies/FOLLOW_UP_24H");
    expect(parsed.searchParams.get("expectedModified")).toBe(
      "2026-10-08T10:00:00.000Z",
    );
    expect(init.method).toBe("DELETE");
  });

  it("surfaces a version conflict", async () => {
    fetchMock.mockResolvedValue(
      json(
        {
          error: {
            code: "REVISION_CONFLICT",
            message: "Timing policy changed; reload before retrying.",
          },
        },
        409,
      ),
    );

    await expect(
      updateTimingPolicy(
        "FOLLOW_UP_24H",
        { triggerType: "relative" },
        "2026-10-08T10:00:00.000Z",
      ),
    ).rejects.toMatchObject({ status: 409, code: "REVISION_CONFLICT" });
  });
});

describe("NBA admin action types", () => {
  it("lists action types with the enabled filter", async () => {
    fetchMock.mockResolvedValue(
      json({
        action_types: [
          {
            name: "CALL",
            action_type: "CALL",
            display_name: "Gọi điện",
            enabled: true,
            sort_order: 1,
          },
        ],
        total: 1,
      }),
    );

    const result = await listAdminActionTypes({ enabled: true });

    const url = new URL(fetchMock.mock.calls[0]![0]);
    expect(url.pathname).toBe("/api/v1/nba/action-types");
    expect(url.searchParams.get("enabled")).toBe("1");
    expect(result.actionTypes[0]).toMatchObject({
      actionType: "CALL",
      displayName: "Gọi điện",
      enabled: true,
    });
  });

  it("creates, updates and deletes an action type", async () => {
    fetchMock.mockImplementation(async () =>
      json({ name: "CALL", action_type: "CALL", display_name: "Gọi điện" }),
    );

    await createAdminActionType({
      actionType: "CALL",
      displayName: "Gọi điện",
      enabled: true,
      sortOrder: 1,
    });
    await updateAdminActionType({
      name: "CALL",
      displayName: "Gọi",
      enabled: false,
    });
    await deleteAdminActionType("CALL");

    const [create, update, remove] = fetchMock.mock.calls;
    expect(create![0]).toBe(`${API}/api/v1/nba/action-types`);
    expect(JSON.parse(create![1].body)).toEqual({
      action_type: "CALL",
      display_name: "Gọi điện",
      enabled: 1,
      sort_order: 1,
    });
    expect(update![0]).toBe(`${API}/api/v1/nba/action-types/CALL`);
    expect(update![1].method).toBe("PATCH");
    expect(JSON.parse(update![1].body)).toEqual({
      display_name: "Gọi",
      enabled: 0,
    });
    expect(remove![1].method).toBe("DELETE");
  });
});
