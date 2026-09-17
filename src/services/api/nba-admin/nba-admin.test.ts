import { describe, expect, it, vi } from "vitest";

import { createTimingPolicy } from "./index";
import { normalizeTimingPolicy } from "./normalizers";

describe("NBA admin API", () => {
  it("normalizes Timing Policy fields from Frappe Resource API", () => {
    expect(normalizeTimingPolicy({
      name: "FOLLOW_UP_24H",
      policy_key: "FOLLOW_UP_24H",
      trigger_type: "relative",
      delay_value: 24,
      delay_unit: "hours",
      time_slot: "6-12",
      recurrence_type: "none",
      optimization_enabled: 0,
    })).toMatchObject({
      name: "FOLLOW_UP_24H",
      policyKey: "FOLLOW_UP_24H",
      triggerType: "relative",
      delayValue: 24,
      timeSlot: "6-12",
      optimizationEnabled: false,
    });
  });

  it("sends Timing Policy as a Resource API payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { name: "FOLLOW_UP_24H", policy_key: "FOLLOW_UP_24H", trigger_type: "relative" } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    try {
      await createTimingPolicy({ policyKey: "FOLLOW_UP_24H", triggerType: "relative", delayValue: 24, delayUnit: "hours", timeSlot: "6-12" }, { baseUrl: "http://frappe:8000" });
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchMock.mock.calls[0][0]).toContain("/api/resource/CRM%20Timing%20Policy");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toMatchObject({ policy_key: "FOLLOW_UP_24H", delay_value: 24, time_slot: "6-12" });
  });

});

