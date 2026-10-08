import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getLeadAssignmentWorkflowConfig,
  updateLeadAssignmentWorkflowStep,
} from "./lead-assignment-workflow-config";

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
    { key: "group", label: "Theo Team Group/tỉnh", enabled: true, priority: 2 },
    { key: "global", label: "Chia đều trong campus", enabled: false, priority: 3 },
  ],
  layerOrder: ["campaign", "group", "global"],
  distributionStrategy: "least_load",
  capacityRequired: true,
  revision: 7,
  version: "lead-routing-v7",
  applyScope: "new_decisions",
  sameCampus: true,
  teamLeadFallback: false,
  lastChangedBy: "lead.sale@example.com",
  lastChangeReason: "Ưu tiên chiến dịch mới",
};

function workflowFixture() {
  return {
    schemaVersion: "lead-assignment-workflow-v1",
    config: {
      schemaVersion: "lead-assignment-workflow-v1",
      version: "lead-assignment-workflow-v3",
      revision: 3,
      applyScope: "new_decisions",
      lastChangedBy: "lead.sale@example.com",
      lastChangeReason: "Giảm tải job nền",
      stored: {
        input: { enabled: false, scheduledMinAgeMinutes: 12, maxLeadsPerRun: 25 },
        classification: { enabled: true },
        review: { maxRetries: 2 },
      },
    },
    steps: {
      input: {
        id: "input",
        enabled: false,
        canToggle: true,
        settings: {
          enabled: false,
          scheduledMinAgeMinutes: 12,
          maxLeadsPerRun: 25,
        },
      },
      validation: {
        id: "validation",
        enabled: true,
        canToggle: false,
        settings: {
          requiredFields: ["student_name", "phone", "province"],
          optionalFields: ["high_school", "major"],
        },
      },
      classification: {
        id: "classification",
        enabled: true,
        canToggle: true,
        settings: { enabled: true },
      },
      matching: {
        id: "matching",
        enabled: true,
        canToggle: false,
        settings: { routingPolicy: policy },
      },
      review: {
        id: "review",
        enabled: true,
        canToggle: false,
        settings: { retryMode: "manual", maxRetries: 2 },
      },
      assignment: {
        id: "assignment",
        enabled: true,
        canToggle: false,
        settings: {
          preserveExistingOwner: true,
          recipientFunctions: ["Sale", "CTV Sale"],
          createStudent: false,
        },
      },
    },
    policy,
    canManage: true,
  };
}

describe("Lead assignment workflow config API contract", () => {
  it("normalizes all fixed steps and legacy limits", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(workflowFixture()), { status: 200 }),
    );

    const result = await getLeadAssignmentWorkflowConfig();

    expect(Object.keys(result.steps)).toEqual([
      "input",
      "validation",
      "classification",
      "matching",
      "review",
      "assignment",
    ]);
    expect(result.config.stored.input.maxLeadsPerRun).toBe(25);
    expect(result.steps.validation.canToggle).toBe(false);
    expect(result.steps.review.settings).toMatchObject({
      retryMode: "manual",
      maxRetries: 2,
    });
    expect(fetchMock.mock.calls[0]![0]).toBe(
      "http://localhost:3001/api/v1/lead-assignment-workflow",
    );
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({
      method: "GET",
      credentials: "include",
    });
  });

  it("sends one step, reason and revision for an update", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(workflowFixture()), { status: 200 }),
    );

    await updateLeadAssignmentWorkflowStep({
      stepId: "review",
      settings: { maxRetries: 4 },
      reason: "Tăng retry cho mùa cao điểm",
      expectedRevision: 3,
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(
      "http://localhost:3001/api/v1/lead-assignment-workflow/steps/review",
    );
    expect(init).toMatchObject({ method: "PUT" });
    expect(JSON.parse(init.body)).toEqual({
      settings: { maxRetries: 4 },
      reason: "Tăng retry cho mùa cao điểm",
      expectedRevision: 3,
    });
  });

  it("preserves a forbidden response as a typed API error", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: "FORBIDDEN", message: "Không có quyền" },
        }),
        { status: 403 },
      ),
    );

    await expect(
      updateLeadAssignmentWorkflowStep({
        stepId: "input",
        settings: { enabled: false },
        reason: "Tắt job nền",
      }),
    ).rejects.toMatchObject({ status: 403, code: "FORBIDDEN" });
  });
});
