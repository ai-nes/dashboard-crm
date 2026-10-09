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

  it("normalizes and saves the explicit routing mode and province team priorities", async () => {
    fetchMock.mockImplementation(() =>
      json({
        policy: {
          ...policy,
          routingMode: "group",
          provinceTeamPriority: { HCM: "team-hcm", invalid: 12 },
        },
        canManage: false,
      }),
    );
    const { getLeadRoutingPolicy, updateLeadRoutingPolicy } =
      await import("../lead-sale/lead-routing-policy");
    const read = await getLeadRoutingPolicy();
    expect(read.policy).toMatchObject({
      routingMode: "group",
      provinceTeamPriority: { HCM: "team-hcm" },
      revision: 2,
      version: "lead-routing-v2",
    });
    expect(read.policy.provinceTeamPriority).not.toHaveProperty("invalid");
    expect(read.canManage).toBe(false);

    const saved = await updateLeadRoutingPolicy({
      enabled: true,
      layerOrder: ["group", "campaign", "global"],
      campaignLayerEnabled: false,
      groupLayerEnabled: true,
      globalLayerEnabled: false,
      distributionStrategy: "round_robin",
      capacityRequired: false,
      routingMode: "group",
      provinceTeamPriority: { HCM: "team-hcm" },
      reason: "Ưu tiên team theo tỉnh",
    });
    const [url, init] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(url).toBe("http://api.test/api/v1/lead-routing-policy");
    expect(init.method).toBe("PUT");
    expect(JSON.parse(String(init.body))).toMatchObject({
      routingMode: "group",
      provinceTeamPriority: { HCM: "team-hcm" },
      layerOrder: "group,campaign,global",
    });
    expect(saved.canManage).toBe(false);
    expect(saved.policy.revision).toBe(2);
  });

  it("falls back to an enabled routing layer for snapshots without a valid explicit mode", async () => {
    fetchMock.mockImplementation(() =>
      json({ policy: { ...policy, routingMode: "unknown" }, canManage: true }),
    );
    const { getLeadRoutingPolicy } =
      await import("../lead-sale/lead-routing-policy");
    const read = await getLeadRoutingPolicy();
    expect(read.policy.routingMode).toBe("campaign");
    expect(read.policy.provinceTeamPriority).toEqual({});
  });

  it("returns normalized matching team options and preserves routing fields on workflow save", async () => {
    const response = {
      schemaVersion: "lead-assignment-workflow-v1",
      config: { revision: 7, version: "workflow-v7" },
      policy: {
        ...policy,
        routingMode: "group",
        provinceTeamPriority: { HCM: "team-hcm" },
      },
      steps: {
        matching: {
          settings: {
            teamOptions: [
              {
                id: "team-hcm",
                label: "Sales HCM",
                province: "HCM",
                provinceLabel: "Hồ Chí Minh",
              },
              { id: "team-hn", province: "HN" },
              { id: 3, province: "HCM" },
              null,
            ],
          },
        },
      },
      canManage: true,
    };
    fetchMock.mockImplementation(() => json(response));
    const {
      getLeadAssignmentWorkflowConfig,
      updateLeadAssignmentWorkflowStep,
    } = await import("../lead-sale/lead-assignment-workflow-config");
    const read = await getLeadAssignmentWorkflowConfig();
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "http://api.test/api/v1/lead-assignment-workflow",
    );
    expect(read.steps.matching.settings).toMatchObject({
      teamOptions: [
        {
          id: "team-hcm",
          label: "Sales HCM",
          province: "HCM",
          provinceLabel: "Hồ Chí Minh",
        },
        {
          id: "team-hn",
          label: "team-hn",
          province: "HN",
          provinceLabel: "HN",
        },
      ],
      routingPolicy: {
        routingMode: "group",
        provinceTeamPriority: { HCM: "team-hcm" },
        revision: 2,
      },
    });
    expect(read.config.revision).toBe(7);
    expect(read.canManage).toBe(true);

    const settings = {
      enabled: true,
      routingMode: "group" as const,
      provinceTeamPriority: { HCM: "team-hcm" },
      distributionStrategy: "round_robin" as const,
      campaignLayerEnabled: false,
      groupLayerEnabled: true,
      globalLayerEnabled: false,
    };
    const saved = await updateLeadAssignmentWorkflowStep({
      stepId: "matching",
      settings,
      reason: "Ưu tiên team theo tỉnh",
      expectedRevision: read.config.revision,
    });
    const [url, init] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(url).toBe(
      "http://api.test/api/v1/lead-assignment-workflow/steps/matching",
    );
    expect(init.method).toBe("PUT");
    expect(JSON.parse(String(init.body))).toEqual({
      settings,
      reason: "Ưu tiên team theo tỉnh",
      expectedRevision: 7,
    });
    expect(saved.steps.matching.settings).toEqual(read.steps.matching.settings);
    expect(saved.config.revision).toBe(7);
    expect(saved.canManage).toBe(true);
  });
});
