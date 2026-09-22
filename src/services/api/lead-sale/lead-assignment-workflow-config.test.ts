import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getLeadAssignmentWorkflowConfig,
  updateLeadAssignmentWorkflowStep,
} from "./lead-assignment-workflow-config";

afterEach(() => vi.restoreAllMocks());

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
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: workflowFixture() }), { status: 200 }),
    );

    const result = await getLeadAssignmentWorkflowConfig({
      baseUrl: "http://frappe:8000",
    });

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
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.assignment_control.get_lead_assignment_workflow_config",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
  });

  it("sends one step, reason and revision for an update", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: workflowFixture() }), { status: 200 }),
    );

    await updateLeadAssignmentWorkflowStep(
      {
        stepId: "review",
        settings: { maxRetries: 4 },
        reason: "Tăng retry cho mùa cao điểm",
        expectedRevision: 3,
      },
      { baseUrl: "http://frappe:8000" },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://frappe:8000/api/method/crm.api.assignment_control.update_lead_assignment_workflow_step",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          step_id: "review",
          settings: JSON.stringify({ maxRetries: 4 }),
          reason: "Tăng retry cho mùa cao điểm",
          expected_revision: 3,
        }),
      }),
    );
  });

  it("preserves a forbidden response as a typed API error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          exception: "frappe.exceptions.PermissionError",
          _error_message: "Không có quyền",
        }),
        { status: 403 },
      ),
    );

    await expect(
      updateLeadAssignmentWorkflowStep(
        {
          stepId: "input",
          settings: { enabled: false },
          reason: "Tắt job nền",
        },
        { baseUrl: "http://frappe:8000" },
      ),
    ).rejects.toMatchObject({ status: 403, code: "FORBIDDEN" });
  });
});
