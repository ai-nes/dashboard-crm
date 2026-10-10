import { describe, expect, it } from "vitest";
import type {
  LeadAssignmentWorkflowMatchingSettings,
  LeadAssignmentWorkflowStepSnapshot,
} from "@/services/api/lead-sale";
import { rebaseWorkflowDraft } from "./lead-assignment-config-draft";

const input: LeadAssignmentWorkflowStepSnapshot = {
  id: "input",
  enabled: true,
  canToggle: true,
  settings: { enabled: true, scheduledMinAgeMinutes: 5, maxLeadsPerRun: 1000 },
};

function matching(): LeadAssignmentWorkflowStepSnapshot {
  return {
    id: "matching",
    enabled: true,
    canToggle: false,
    settings: {
      noEligibleOutcome: "review",
      routingPolicy: {
        enabled: true,
        routingMode: "global",
        distributionStrategy: "round_robin",
        capacityRequired: true,
        layers: ["global", "group", "campaign"].map((key, index) => ({
          key: key as "global" | "group" | "campaign",
          label: key,
          enabled: key === "global",
          priority: index + 1,
        })),
        layerOrder: ["global", "group", "campaign"],
        provinceTeamPriority: { hanoi: "old-team" },
        revision: 1,
        version: "v1",
        applyScope: "new_decisions",
        sameCampus: true,
        teamLeadFallback: false,
        lastChangedBy: null,
        lastChangeReason: null,
      },
    },
  };
}

describe("preserving edits across newer workflow configurations", () => {
  it("keeps only edited intake values and retains concurrent changes", () => {
    const draft = {
      ...input,
      settings: { ...input.settings, maxLeadsPerRun: 250 },
    };
    const latest = {
      ...input,
      settings: { ...input.settings, scheduledMinAgeMinutes: 12 },
    };
    expect(rebaseWorkflowDraft(draft, input, latest).settings).toMatchObject({
      maxLeadsPerRun: 250,
      scheduledMinAgeMinutes: 12,
    });
  });

  it("retains concurrent team mappings and routing metadata when the user changes mode", () => {
    const previous = matching();
    const draft = structuredClone(previous);
    const latest = structuredClone(previous);
    const editedPolicy = (
      draft.settings as LeadAssignmentWorkflowMatchingSettings
    ).routingPolicy;
    editedPolicy.routingMode = "campaign";
    editedPolicy.layers.forEach((layer) => {
      layer.enabled = layer.key === "campaign";
    });
    const latestPolicy = (
      latest.settings as LeadAssignmentWorkflowMatchingSettings
    ).routingPolicy;
    latestPolicy.provinceTeamPriority = { hanoi: "new-team", hue: "hue-team" };
    latestPolicy.revision = 2;
    latestPolicy.layers[0].priority = 3;
    const result = (
      rebaseWorkflowDraft(draft, previous, latest)
        .settings as LeadAssignmentWorkflowMatchingSettings
    ).routingPolicy;
    expect(result.routingMode).toBe("campaign");
    expect(result.provinceTeamPriority).toEqual({
      hanoi: "new-team",
      hue: "hue-team",
    });
    expect(result.revision).toBe(2);
    expect(result.layers[0]).toMatchObject({ enabled: false, priority: 3 });
  });

  it("merges per-province edits and removals while preserving other updated provinces", () => {
    const previous = matching();
    const draft = structuredClone(previous);
    const latest = structuredClone(previous);
    (
      draft.settings as LeadAssignmentWorkflowMatchingSettings
    ).routingPolicy.provinceTeamPriority = { danang: "my-team" };
    (
      latest.settings as LeadAssignmentWorkflowMatchingSettings
    ).routingPolicy.provinceTeamPriority = {
      hanoi: "old-team",
      hue: "new-team",
    };
    const result = (
      rebaseWorkflowDraft(draft, previous, latest)
        .settings as LeadAssignmentWorkflowMatchingSettings
    ).routingPolicy;
    expect(result.provinceTeamPriority).toEqual({
      danang: "my-team",
      hue: "new-team",
    });
  });
});
