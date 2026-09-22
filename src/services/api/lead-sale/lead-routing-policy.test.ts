import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getLeadRoutingPolicy,
  updateLeadRoutingPolicy,
} from "./lead-routing-policy";

afterEach(() => vi.restoreAllMocks());

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
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            schemaVersion: "lead-routing-policy-v1",
            policy,
            canManage: true,
          },
        }),
        { status: 200 },
      ),
    );

    await expect(
      getLeadRoutingPolicy({ baseUrl: "http://frappe:8000" }),
    ).resolves.toMatchObject({
      schemaVersion: "lead-routing-policy-v1",
      canManage: true,
      policy: {
        version: "lead-routing-v3",
        distributionStrategy: "least_load",
        layerOrder: ["campaign", "group", "global"],
      },
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.assignment_control.get_lead_routing_policy_snapshot",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
  });

  it("serializes an immediate policy update", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: { policy, canManage: true } }), {
        status: 200,
      }),
    );

    await updateLeadRoutingPolicy(
      {
        enabled: true,
        layerOrder: ["global", "group", "campaign"],
        campaignLayerEnabled: false,
        groupLayerEnabled: true,
        globalLayerEnabled: true,
        distributionStrategy: "round_robin",
        capacityRequired: false,
        reason: "Mở chia đều campus",
      },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.assignment_control.update_lead_routing_policy",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          enabled: true,
          layer_order: "global,group,campaign",
          campaign_layer_enabled: false,
          group_layer_enabled: true,
          global_layer_enabled: true,
          distribution_strategy: "round_robin",
          capacity_required: false,
          reason: "Mở chia đều campus",
        }),
      }),
    );
  });
});
