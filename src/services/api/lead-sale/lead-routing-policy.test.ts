import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getLeadRoutingPolicy,
  updateLeadRoutingPolicy,
} from "./lead-routing-policy";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://localhost:3001");
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

const policy = {
  enabled: true,
  layers: [
    { key: "campaign", label: "Theo chiến dịch", enabled: true, priority: 1 },
    { key: "group", label: "Theo Group", enabled: true, priority: 2 },
    { key: "global", label: "Theo campus", enabled: false, priority: 3 },
  ],
  layerOrder: ["campaign", "group", "global"],
  distributionStrategy: "least_load",
  capacityRequired: true,
  revision: 3,
  version: "lead-routing-v3",
  applyScope: "new_decisions",
  sameCampus: true,
  teamLeadFallback: false,
  lastChangedBy: "Administrator",
  lastChangeReason: "Ưu tiên campaign",
};

describe("Lead routing policy API contract", () => {
  it("loads and normalizes the policy envelope", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          schemaVersion: "lead-routing-policy-v1",
          policy,
          canManage: true,
        }),
        { status: 200 },
      ),
    );

    await expect(getLeadRoutingPolicy()).resolves.toMatchObject({
      schemaVersion: "lead-routing-policy-v1",
      canManage: true,
      policy: {
        version: "lead-routing-v3",
        distributionStrategy: "least_load",
        layerOrder: ["campaign", "group", "global"],
      },
    });

    expect(fetchMock.mock.calls[0]![0]).toBe(
      "http://localhost:3001/api/v1/lead-routing-policy",
    );
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({
      method: "GET",
      credentials: "include",
    });
  });

  it("serializes an immediate policy update", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ policy, canManage: true }), {
        status: 200,
      }),
    );

    await updateLeadRoutingPolicy({
      enabled: true,
      layerOrder: ["global", "group", "campaign"],
      campaignLayerEnabled: false,
      groupLayerEnabled: true,
      globalLayerEnabled: true,
      distributionStrategy: "round_robin",
      reason: "Mở chia đều campus",
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://localhost:3001/api/v1/lead-routing-policy");
    expect(init).toMatchObject({ method: "PUT" });
    expect(JSON.parse(init.body)).toEqual({
      enabled: true,
      layerOrder: "global,group,campaign",
      campaignLayerEnabled: false,
      groupLayerEnabled: true,
      globalLayerEnabled: true,
      distributionStrategy: "round_robin",
      reason: "Mở chia đều campus",
    });
  });
});
