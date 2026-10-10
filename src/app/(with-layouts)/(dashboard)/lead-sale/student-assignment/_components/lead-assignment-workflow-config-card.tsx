"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
import { useAuth } from "@/components/common/auth/auth-provider";
import { hasCrmCapability } from "@/components/common/auth/permissions";
import {
  useLeadAssignmentWorkflowConfigQuery,
  useUpdateLeadAssignmentWorkflowStepMutation,
} from "@/hooks/use-lead-assignment-workflow-config-queries";
import type {
  LeadAssignmentWorkflowConfigResponse,
  LeadAssignmentWorkflowStepSnapshot,
  LeadAssignmentWorkflowStepUpdate,
  LeadAssignmentWorkflowReviewSettings,
  LeadAssignmentWorkflowMatchingSettings,
  LeadAssignmentWorkflowValidationSettings,
} from "@/services/api/lead-sale";
import LeadAssignmentConfigSection from "./lead-assignment-config-section";
import LeadAssignmentConfigRules from "./lead-assignment-config-rules";
import { rebaseWorkflowDraft } from "./lead-assignment-config-draft";
import LeadAssignmentWorkflowStepPanel from "./lead-assignment-workflow-step-panel";
import LeadAssignmentStepToggle from "./lead-assignment-step-toggle";
type EditableStepId = "matching" | "input" | "classification" | "review";
type Drafts = Partial<
  Record<EditableStepId, LeadAssignmentWorkflowStepSnapshot>
>;
function rebaseDrafts(
  drafts: Drafts,
  previous: LeadAssignmentWorkflowConfigResponse,
  latest: LeadAssignmentWorkflowConfigResponse,
): Drafts {
  return Object.fromEntries(
    Object.entries(drafts).map(([key, draft]) => {
      const id = key as EditableStepId;
      return [
        id,
        rebaseWorkflowDraft(draft, previous.steps[id], latest.steps[id]),
      ];
    }),
  );
}
const sections: { id: EditableStepId; title: string }[] = [
  { id: "matching", title: "Người nhận Lead" },
  { id: "input", title: "Tiếp nhận tự động" },
  { id: "classification", title: "Kiểm tra Lead" },
  { id: "review", title: "Xử lý lại" },
];
const sectionGroups = [
  sections.filter(({ id }) => id === "matching"),
  sections.filter(({ id }) => id !== "matching"),
];

export default function LeadAssignmentWorkflowConfigCard() {
  const { user } = useAuth();
  const configQuery = useLeadAssignmentWorkflowConfigQuery();
  const updateMutation = useUpdateLeadAssignmentWorkflowStepMutation();
  const [localResponse, setLocalResponse] =
    useState<LeadAssignmentWorkflowConfigResponse | null>(null);
  const [drafts, setDrafts] = useState<Drafts>({});
  const [conflicts, setConflicts] = useState<
    Partial<Record<EditableStepId, boolean>>
  >({});
  const [saveErrors, setSaveErrors] = useState<
    Partial<Record<EditableStepId, string>>
  >({});
  const [savingStep, setSavingStep] = useState<EditableStepId | null>(null);
  const isSaving = updateMutation.isPending || savingStep !== null;
  const sourceResponse = localResponse ?? configQuery.data;
  const canEdit = Boolean(
    sourceResponse?.canManage &&
    (hasCrmCapability(user, "system.configure") ||
      hasCrmCapability(user, "student.routing.operate")),
  );

  function updateStepSettings(
    id: EditableStepId,
    settings: Record<string, unknown>,
  ) {
    if (!canEdit || isSaving) return;
    setSaveErrors((current) => ({ ...current, [id]: undefined }));
    setDrafts((current) => {
      const step = current[id] ?? sourceResponse?.steps[id];
      if (!step) return current;
      return {
        ...current,
        [id]: {
          ...step,
          enabled:
            step.canToggle && typeof settings.enabled === "boolean"
              ? settings.enabled
              : step.enabled,
          settings: settings as LeadAssignmentWorkflowStepSnapshot["settings"],
        },
      };
    });
  }

  function resetStep(id: EditableStepId) {
    if (isSaving) return;
    setConflicts((current) => ({ ...current, [id]: false }));
    setDrafts((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setSaveErrors((current) => ({ ...current, [id]: undefined }));
  }

  async function saveStep(id: EditableStepId) {
    const configuration = drafts[id];
    if (
      !sourceResponse ||
      !configuration ||
      !canEdit ||
      conflicts[id] ||
      isSaving
    )
      return;
    let settings: LeadAssignmentWorkflowStepUpdate["settings"];
    if (id === "matching") {
      const policy = (
        configuration.settings as LeadAssignmentWorkflowMatchingSettings
      ).routingPolicy;
      settings = {
        enabled: policy.enabled,
        layerOrder: policy.layerOrder,
        campaignLayerEnabled: Boolean(
          policy.layers.find((layer) => layer.key === "campaign")?.enabled,
        ),
        groupLayerEnabled: Boolean(
          policy.layers.find((layer) => layer.key === "group")?.enabled,
        ),
        globalLayerEnabled: Boolean(
          policy.layers.find((layer) => layer.key === "global")?.enabled,
        ),
        distributionStrategy: policy.distributionStrategy,
        capacityRequired: policy.capacityRequired,
        routingMode: policy.routingMode,
        provinceTeamPriority: policy.provinceTeamPriority,
      };
    } else if (id === "review") {
      settings = {
        maxRetries: (
          configuration.settings as LeadAssignmentWorkflowReviewSettings
        ).maxRetries,
      };
    } else {
      settings =
        configuration.settings as LeadAssignmentWorkflowStepUpdate["settings"];
    }
    setSavingStep(id);
    try {
      const response = await updateMutation.mutateAsync({
        stepId: id,
        settings,
        reason: "Cập nhật cấu hình phân công Lead",
        expectedRevision: sourceResponse.config.revision,
      });
      setLocalResponse(response);
      setDrafts((current) => {
        const next = rebaseDrafts(current, sourceResponse, response);
        delete next[id];
        return next;
      });
      toast.success("Đã lưu và áp dụng cấu hình.");
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "WORKFLOW_REVISION_CONFLICT"
      ) {
        const refreshed = await configQuery.refetch();
        const latest = refreshed.data;
        if (latest) {
          setLocalResponse(latest);
          setDrafts((current) => rebaseDrafts(current, sourceResponse, latest));
        }
        setConflicts((current) => ({
          ...current,
          ...Object.fromEntries(
            Object.entries(drafts)
              .filter(
                ([key, draft]) =>
                  JSON.stringify(draft) !==
                  JSON.stringify(sourceResponse.steps[key as EditableStepId]),
              )
              .map(([key]) => [key, true]),
          ),
        }));
        toast.error(
          "Cấu hình đã đổi. Phần đang sửa được giữ lại; hãy kiểm tra trước khi lưu.",
        );
        return;
      }
      setSaveErrors((current) => ({
        ...current,
        [id]:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật cấu hình phân công.",
      }));
    } finally {
      setSavingStep(null);
    }
  }

  const autoSave = useEffectEvent(saveStep);
  const nextStep = sections.find(
    ({ id }) =>
      drafts[id] &&
      !conflicts[id] &&
      !saveErrors[id] &&
      JSON.stringify(drafts[id]) !== JSON.stringify(sourceResponse?.steps[id]),
  )?.id;
  useEffect(() => {
    if (!canEdit || isSaving || !nextStep) return;
    const timer = setTimeout(() => void autoSave(nextStep), 600);
    return () => clearTimeout(timer);
  }, [canEdit, isSaving, nextStep, drafts, sourceResponse]);

  if (configQuery.isPending && !sourceResponse)
    return (
      <div role="status" aria-label="Đang tải cấu hình phân công">
        <Card className="space-y-4 motion-safe:animate-pulse">
          <div className="h-6 w-64 max-w-full rounded bg-card-border/60" />
          <div className="h-52 rounded bg-card-border/30" />
          <div className="h-24 rounded bg-card-border/30" />
        </Card>
      </div>
    );
  if (configQuery.isError && !sourceResponse)
    return (
      <div role="alert">
        <Card className="text-sm text-badge-error-text">
          Không thể tải cấu hình phân công Lead: {configQuery.error.message}
        </Card>
      </div>
    );
  if (!sourceResponse) return null;

  return (
    <div className="space-y-4">
      {!canEdit && <Badge color="gray">Chỉ có quyền xem</Badge>}
      <div className="grid items-start gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <LeadAssignmentConfigRules
          validation={
            sourceResponse.steps.validation
              .settings as LeadAssignmentWorkflowValidationSettings
          }
        />
        <div className="@container min-w-0 space-y-4">
          {sectionGroups.map((group, index) => (
            <div
              key={index}
              className={
                index === 0 ? undefined : "grid gap-4 @3xl:grid-cols-3"
              }
            >
              {group.map(({ id, title }) => {
                const configuration = drafts[id] ?? sourceResponse.steps[id];
                const isDirty =
                  JSON.stringify(configuration) !==
                  JSON.stringify(sourceResponse.steps[id]);
                return (
                  <LeadAssignmentConfigSection
                    key={id}
                    id={id}
                    title={title}
                    headerAction={
                      <LeadAssignmentStepToggle
                        configuration={configuration}
                        canEdit={canEdit}
                        isSaving={isSaving}
                        onSettingsChange={(settings) =>
                          updateStepSettings(id, settings)
                        }
                      />
                    }
                    canEdit={canEdit}
                    isDirty={isDirty}
                    isSaving={savingStep === id}
                    isBusy={isSaving}
                    saveError={saveErrors[id]}
                    onRetry={() =>
                      setSaveErrors((current) => ({
                        ...current,
                        [id]: undefined,
                      }))
                    }
                    hasConflict={conflicts[id]}
                    onKeepDraft={() =>
                      setConflicts((current) => ({ ...current, [id]: false }))
                    }
                    onReset={() => resetStep(id)}
                  >
                    <LeadAssignmentWorkflowStepPanel
                      configuration={configuration}
                      canEdit={canEdit}
                      isSaving={isSaving}
                      onSettingsChange={(settings) =>
                        updateStepSettings(id, settings)
                      }
                    />
                  </LeadAssignmentConfigSection>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
