"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/tailgrids/core/card";
import { useAuth } from "@/components/common/auth/auth-provider";
import { hasCrmCapability } from "@/components/common/auth/permissions";
import {
  useLeadAssignmentWorkflowConfigQuery,
  useUpdateLeadAssignmentWorkflowStepMutation,
} from "@/hooks/use-lead-assignment-workflow-config-queries";
import type {
  LeadAssignmentWorkflowConfigResponse,
  LeadAssignmentWorkflowStepId,
  LeadAssignmentWorkflowStepSnapshot,
  LeadAssignmentWorkflowStepUpdate,
} from "@/services/api/lead-sale";
import { cn } from "@/utils/cn";
import { workflowSteps } from "../../_shared/student-assignment/data";
import type { StepId } from "../../_shared/student-assignment/types";
import LeadAssignmentWorkflowStepPanel from "./lead-assignment-workflow-step-panel";

type StepMap = Record<
  LeadAssignmentWorkflowStepId,
  LeadAssignmentWorkflowStepSnapshot
>;

function sameStep(
  left: LeadAssignmentWorkflowStepSnapshot | undefined,
  right: LeadAssignmentWorkflowStepSnapshot | undefined,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export default function LeadAssignmentWorkflowConfigCard() {
  const { user } = useAuth();
  const configQuery = useLeadAssignmentWorkflowConfigQuery();
  const updateMutation = useUpdateLeadAssignmentWorkflowStepMutation();
  const [selectedStep, setSelectedStep] = useState<StepId>("input");
  const [localResponse, setLocalResponse] =
    useState<LeadAssignmentWorkflowConfigResponse | null>(null);
  const [draftSteps, setDraftSteps] = useState<StepMap | null>(null);
  const [reason, setReason] = useState("");

  const sourceResponse = localResponse ?? configQuery.data ?? null;
  const serverSteps = sourceResponse?.steps ?? null;
  const activeSteps = draftSteps ?? serverSteps;
  const canEdit = Boolean(
    sourceResponse?.canManage &&
    (hasCrmCapability(user, "system.configure") ||
      hasCrmCapability(user, "student.routing.operate")),
  );
  const selectedConfiguration = activeSteps?.[selectedStep];
  const selectedServerConfiguration = serverSteps?.[selectedStep];
  const isDirty = Boolean(
    selectedConfiguration &&
    selectedServerConfiguration &&
    !sameStep(selectedConfiguration, selectedServerConfiguration),
  );
  const selectedWorkflowStep = workflowSteps.find(
    (step) => step.id === selectedStep,
  );

  const updateStepSettings = (
    stepId: StepId,
    settings: Record<string, unknown>,
  ) => {
    setDraftSteps((current) => {
      const base = current ?? serverSteps;
      if (!base) return current;
      const step = base[stepId];
      if (!step) return current;

      const canToggle = step.canToggle && typeof settings.enabled === "boolean";
      return {
        ...base,
        [stepId]: {
          ...step,
          enabled: canToggle ? Boolean(settings.enabled) : step.enabled,
          settings: settings as LeadAssignmentWorkflowStepSnapshot["settings"],
        },
      };
    });
  };

  const saveSelectedStep = async () => {
    if (!sourceResponse || !selectedConfiguration || !canEdit) return;
    if (reason.trim().length < 5) {
      toast.error("Hãy ghi lý do thay đổi ít nhất 5 ký tự.");
      return;
    }

    const settings = selectedConfiguration.settings as Record<string, unknown>;
    let requestSettings: LeadAssignmentWorkflowStepUpdate["settings"];

    if (selectedStep === "matching") {
      const policy = settings.routingPolicy as {
        enabled: boolean;
        layerOrder: string[];
        layers: { key: string; enabled: boolean }[];
        distributionStrategy: "least_load" | "round_robin";
        capacityRequired: boolean;
      };
      requestSettings = {
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
      };
    } else if (selectedStep === "review") {
      requestSettings = { maxRetries: Number(settings.maxRetries) || 0 };
    } else {
      requestSettings =
        settings as LeadAssignmentWorkflowStepUpdate["settings"];
    }

    try {
      const response = await updateMutation.mutateAsync({
        stepId: selectedStep,
        settings: requestSettings,
        reason: reason.trim(),
        expectedRevision: sourceResponse.config.revision,
      });
      setLocalResponse(response);
      setDraftSteps(null);
      setReason("");
      toast.success("Đã lưu và áp dụng cấu hình bước.");
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "WORKFLOW_REVISION_CONFLICT"
      ) {
        setLocalResponse(null);
        setDraftSteps(null);
        await configQuery.refetch();
      }
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật cấu hình workflow.",
      );
    }
  };

  if (configQuery.isPending && !sourceResponse) {
    return (
      <Card className="animate-pulse space-y-3">
        <div className="h-5 w-72 rounded bg-card-border/60" />
        <div className="h-4 w-full rounded bg-card-border/40" />
        <div className="h-80 rounded bg-card-border/30" />
      </Card>
    );
  }

  if (configQuery.isError && !sourceResponse) {
    return (
      <Card role="alert" className="text-sm text-badge-error-text">
        Không thể tải cấu hình workflow phân công Lead:{" "}
        {configQuery.error.message}
      </Card>
    );
  }

  if (
    !sourceResponse ||
    !activeSteps ||
    !selectedConfiguration ||
    !selectedWorkflowStep
  ) {
    return null;
  }

  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">Cấu hình phân công Lead</CardTitle>
              <Badge color="success">Đang áp dụng</Badge>
            </div>
            <CardDescription className="mt-1 max-w-3xl text-sm leading-6">
              Áp dụng cho lần phân công mới. Lead đã có người phụ trách được giữ
              nguyên.
            </CardDescription>
          </div>
          {!canEdit && (
            <Badge color="gray" className="shrink-0">
              Chỉ có quyền xem
            </Badge>
          )}
        </div>
      </CardHeader>

      <div className="grid border-t border-card-border lg:grid-cols-[320px_minmax(0,1fr)]">
        <nav
          aria-labelledby="lead-assignment-config-steps"
          className="min-w-0 border-b border-card-border bg-background-gray-secondary/30 p-4 lg:border-r lg:border-b-0"
        >
          <div className="mb-3 px-2">
            <h2
              id="lead-assignment-config-steps"
              className="text-sm font-semibold text-text-primary"
            >
              Quy trình phân công
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              Chọn một bước để xem cấu hình.
            </p>
          </div>
          <ol className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
            {workflowSteps.map((step, index) => {
              const snapshot = activeSteps[step.id];
              const selected = selectedStep === step.id;
              if (!snapshot) return null;
              const dirty = !sameStep(snapshot, serverSteps?.[step.id]);

              return (
                <li key={step.id} className="min-w-0">
                  <Button
                    type="button"
                    appearance="ghost"
                    onPress={() => setSelectedStep(step.id)}
                    isDisabled={updateMutation.isPending}
                    aria-current={selected ? "step" : undefined}
                    aria-controls="lead-assignment-step-detail"
                    className={cn(
                      "h-auto w-full items-start justify-start gap-3 px-3 py-3 text-left motion-reduce:transition-none",
                      selected
                        ? "bg-badge-primary-background hover:bg-badge-primary-background"
                        : "hover:bg-background-gray-secondary",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                        selected
                          ? "bg-button-primary-background text-button-primary-text"
                          : "bg-background-gray-secondary text-text-secondary",
                      )}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium leading-5 text-text-primary">
                        {step.title.replace(/^Bước \d+ · /, "")}
                      </span>
                      <span className="mt-1 block text-xs font-normal leading-5 text-text-secondary">
                        {snapshot.canToggle
                          ? snapshot.enabled
                            ? "Đang bật"
                            : "Đang tắt"
                          : "Luôn bật"}
                        {dirty ? " · Chưa lưu" : ""}
                      </span>
                    </span>
                  </Button>
                </li>
              );
            })}
          </ol>
        </nav>

        <LeadAssignmentWorkflowStepPanel
          step={selectedWorkflowStep}
          configuration={selectedConfiguration}
          canEdit={canEdit}
          isSaving={updateMutation.isPending}
          isDirty={isDirty}
          reason={reason}
          onReasonChange={setReason}
          onSettingsChange={(settings) =>
            updateStepSettings(selectedStep, settings)
          }
          onSave={() => void saveSelectedStep()}
        />
      </div>
    </Card>
  );
}
