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

const policy = {
  enabled: true,
  layers: [
    { key: "campaign", label: "Theo chiến dịch", enabled: true, priority: 1 },
  ],
  layerOrder: ["campaign", "group", "global"],
  distributionStrategy: "least_load",
  capacityRequired: true,
  revision: 2,
  version: "lead-routing-v2",
};

describe("lead assignment control with the Nest backend", () => {
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

  it("reads and saves the routing policy through /api/v1", async () => {
    fetchMock.mockImplementation(() =>
      json({
        schemaVersion: "lead-routing-policy-v1",
        policy,
        canManage: true,
      }),
    );
    const { getLeadRoutingPolicy, updateLeadRoutingPolicy } =
      await import("../lead-sale/lead-routing-policy");
    const read = await getLeadRoutingPolicy();
    expect(read.policy.revision).toBe(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "http://api.test/api/v1/lead-routing-policy",
    );

    await updateLeadRoutingPolicy({
      enabled: true,
      layerOrder: ["group", "campaign", "global"],
      campaignLayerEnabled: true,
      groupLayerEnabled: true,
      globalLayerEnabled: false,
      distributionStrategy: "round_robin",
      capacityRequired: false,
      reason: "Đổi thứ tự",
    });
    const [, init] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(init.method).toBe("PUT");
    expect(JSON.parse(String(init.body))).toMatchObject({
      layerOrder: "group,campaign,global",
      globalLayerEnabled: false,
      reason: "Đổi thứ tự",
    });
  });

  it("surfaces a workflow revision conflict with its code", async () => {
    fetchMock.mockImplementation(() =>
      json(
        {
          error: {
            code: "WORKFLOW_REVISION_CONFLICT",
            message: "Đã thay đổi.",
          },
        },
        409,
      ),
    );
    const { updateLeadAssignmentWorkflowStep } =
      await import("../lead-sale/lead-assignment-workflow-config");
    await expect(
      updateLeadAssignmentWorkflowStep({
        stepId: "input",
        settings: { enabled: false },
        reason: "Tạm dừng",
        expectedRevision: 1,
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: "WORKFLOW_REVISION_CONFLICT",
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "http://api.test/api/v1/lead-assignment-workflow/steps/input",
    );
  });
});
