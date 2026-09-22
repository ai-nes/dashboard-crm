"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight } from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/tailgrids/core/card";
import { Toggle } from "@/components/tailgrids/core/toggle";
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
import { stepIcons, toneClasses } from "../../_shared/student-assignment/mappings";
import type { StepId } from "../../_shared/student-assignment/types";
import LeadAssignmentWorkflowStepPanel from "./lead-assignment-workflow-step-panel";

type StepMap = Record<
  LeadAssignmentWorkflowStepId,
  LeadAssignmentWorkflowStepSnapshot
>;

function configMetric(snapshot: LeadAssignmentWorkflowStepSnapshot): string {
  const settings = snapshot.settings as Record<string, unknown>;

  switch (snapshot.id) {
    case "input":
      return snapshot.enabled
        ? `Job nền · tối đa ${settings.maxLeadsPerRun as number} Lead`
        : "Job nền đang tắt";
    case "validation":
      return "3 trường bắt buộc · luôn hoạt động";
    case "classification":
      return snapshot.enabled
        ? "Chạy xác định kết quả xử lý"
        : "Dùng kết quả xử lý đã lưu";
    case "matching": {
      const policy = settings.routingPolicy as {
        layers?: { enabled: boolean }[];
      };
      const enabled = policy.layers?.filter((layer) => layer.enabled).length ?? 0;
      return `${enabled} lớp phân tuyến · kéo để đổi ưu tiên`;
    }
    case "review":
      return `Retry thủ công · tối đa ${settings.maxRetries as number} lần`;
    case "assignment":
      return "Giữ ownership · không tạo Student";
  }
}

function sameStep(
  left: LeadAssignmentWorkflowStepSnapshot | undefined,
  right: LeadAssignmentWorkflowStepSnapshot | undefined,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function editableStep(stepId: StepId): boolean {
  return ["input", "classification", "matching", "review"].includes(stepId);
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
      requestSettings = settings as LeadAssignmentWorkflowStepUpdate["settings"];
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
        Không thể tải cấu hình workflow phân công Lead: {configQuery.error.message}
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
              <Badge color="gray">{sourceResponse.config.version}</Badge>
            </div>
            <CardDescription className="mt-1 max-w-3xl text-sm leading-6">
              Chọn một bước để xem hoặc sửa. Cấu hình chỉ áp dụng cho quyết định mới;
              Lead đã có người phụ trách không bị phân công lại.
            </CardDescription>
          </div>
          {!canEdit && (
            <Badge color="gray" className="shrink-0">
              Chỉ có quyền xem
            </Badge>
          )}
        </div>
      </CardHeader>

      <div className="grid gap-4 border-t border-card-border p-4 lg:grid-cols-[minmax(300px,0.85fr)_minmax(380px,1.15fr)] lg:p-5">
        <section
          aria-labelledby="lead-assignment-config-steps"
          className="min-w-0 rounded-xl border border-card-border bg-background-gray-secondary/30 p-3"
        >
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <div>
              <h2
                id="lead-assignment-config-steps"
                className="text-sm font-semibold text-text-primary"
              >
                Các bước nghiệp vụ
              </h2>
              <p className="mt-1 text-xs text-text-tertiary">
                Bật/tắt bước cho phép và bấm Sửa để hiệu chỉnh.
              </p>
            </div>
            <Badge color="gray">6 bước</Badge>
          </div>

          <div className="space-y-2">
            {workflowSteps.map((step, index) => {
              const snapshot = activeSteps[step.id];
              const Icon = stepIcons[step.id];
              const selected = selectedStep === step.id;
              const canToggle = Boolean(snapshot?.canToggle);
              const canEditStep = canEdit && editableStep(step.id);

              if (!snapshot) return null;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border bg-card-background p-2 transition-colors",
                    selected
                      ? "border-primary-500 ring-2 ring-primary-100"
                      : "border-card-border",
                  )}
                >
                  <Button
                    type="button"
                    appearance="ghost"
                    onPress={() => setSelectedStep(step.id)}
                    className="min-w-0 flex-1 justify-start gap-2.5 p-1.5 text-left"
                    aria-label={`Xem cấu hình ${step.title}`}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        toneClasses[step.tone],
                      )}
                    >
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text-tertiary">
                          {index + 1}.
                        </span>
                        <span className="truncate text-sm font-medium text-text-primary">
                          {step.title.replace(/^Bước \d+ · /, "")}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-xs font-normal text-text-tertiary">
                        {configMetric(snapshot)}
                      </span>
                    </span>
                    <ArrowRight
                      size={14}
                      className="shrink-0 text-text-tertiary"
                      aria-hidden="true"
                    />
                  </Button>

                  <div className="flex shrink-0 items-center gap-2">
                    {canToggle && canEdit ? (
                      <Toggle
                        label={snapshot.enabled ? "Bật" : "Tắt"}
                        checked={snapshot.enabled}
                        disabled={updateMutation.isPending}
                        onChange={(event) => {
                          setSelectedStep(step.id);
                          updateStepSettings(step.id, {
                            ...(snapshot.settings as Record<string, unknown>),
                            enabled: event.target.checked,
                          });
                        }}
                        aria-label={`${snapshot.enabled ? "Tắt" : "Bật"} ${step.title}`}
                      />
                    ) : (
                      <Badge
                        color={
                          canToggle && !snapshot.enabled
                            ? "gray"
                            : canToggle
                              ? "success"
                              : "primary"
                        }
                        className="text-[10px]"
                      >
                        {canToggle
                          ? snapshot.enabled
                            ? "Bật"
                            : "Tắt"
                          : "Bắt buộc"}
                      </Badge>
                    )}
                    {canEditStep ? (
                      <Button
                        type="button"
                        size="xs"
                        appearance="outline"
                        onPress={() => setSelectedStep(step.id)}
                      >
                        Sửa
                      </Button>
                    ) : (
                      <span className="px-1 text-[11px] text-text-tertiary">Xem</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

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
