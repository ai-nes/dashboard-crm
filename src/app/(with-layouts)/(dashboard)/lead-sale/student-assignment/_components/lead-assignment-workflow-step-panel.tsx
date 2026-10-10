"use client";

import { Input } from "@/components/tailgrids/core/input";
import type {
  LeadAssignmentWorkflowInputSettings,
  LeadAssignmentWorkflowMatchingSettings,
  LeadAssignmentWorkflowReviewSettings,
  LeadAssignmentWorkflowStepSnapshot,
} from "@/services/api/lead-sale";
import LeadRoutingSettings from "./lead-routing-settings";

type Props = {
  configuration: LeadAssignmentWorkflowStepSnapshot;
  canEdit: boolean;
  isSaving: boolean;
  onSettingsChange: (settings: Record<string, unknown>) => void;
};

export default function LeadAssignmentWorkflowStepPanel({
  configuration,
  canEdit,
  isSaving,
  onSettingsChange,
}: Props) {
  const settings = configuration.settings;

  if (configuration.id === "matching") {
    const matching = settings as LeadAssignmentWorkflowMatchingSettings;
    return (
      <LeadRoutingSettings
        policy={matching.routingPolicy}
        teamOptions={matching.teamOptions}
        canEdit={canEdit}
        isSaving={isSaving}
        onChange={(routingPolicy) =>
          onSettingsChange({ ...settings, routingPolicy })
        }
      />
    );
  }

  if (configuration.id === "input") {
    const input = settings as LeadAssignmentWorkflowInputSettings;
    return (
      <div className="space-y-5">
        {canEdit ? (
          <div className="grid max-w-3xl items-end gap-3 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium text-text-primary">
              <span>Chờ (phút)</span>
              <Input
                type="number"
                min={0}
                max={1440}
                value={String(input.scheduledMinAgeMinutes)}
                disabled={isSaving}
                aria-label="Thời gian chờ tự động (phút)"
                className="h-11 w-full text-sm"
                onChange={(event) =>
                  onSettingsChange({
                    ...input,
                    scheduledMinAgeMinutes: Number(event.target.value) || 0,
                  })
                }
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-text-primary">
              <span>Lead/lượt</span>
              <Input
                type="number"
                min={1}
                max={1000}
                value={String(input.maxLeadsPerRun)}
                disabled={isSaving}
                aria-label="Giới hạn Lead mỗi lần chạy"
                className="h-11 w-full text-sm"
                onChange={(event) =>
                  onSettingsChange({
                    ...input,
                    maxLeadsPerRun: Number(event.target.value) || 1,
                  })
                }
              />
            </label>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            Thời gian chờ: {input.scheduledMinAgeMinutes} phút · Tối đa{" "}
            {input.maxLeadsPerRun.toLocaleString("vi-VN")} Lead mỗi lượt.
          </p>
        )}
        <p className="text-xs leading-5 text-text-secondary">
          Chạy thủ công không cần chờ.
        </p>
      </div>
    );
  }

  if (configuration.id === "classification") {
    const enabled = (settings as { enabled: boolean }).enabled;
    return (
      <p className="text-sm leading-6 text-pretty text-text-secondary">
        {enabled
          ? "Kiểm tra trùng lặp trước khi phân công."
          : "Dùng kết quả có sẵn, không kiểm tra lại."}
      </p>
    );
  }

  if (configuration.id === "review") {
    const review = settings as LeadAssignmentWorkflowReviewSettings;
    return (
      <div className="space-y-4">
        <p className="max-w-3xl text-sm leading-6 text-pretty text-text-secondary">
          Xử lý lại thủ công các Lead trong “Cần kiểm tra”.
        </p>
        {canEdit ? (
          <label className="block max-w-sm space-y-2 text-sm font-medium text-text-primary">
            <span>Số lần tối đa</span>
            <Input
              type="number"
              min={0}
              max={10}
              value={String(review.maxRetries)}
              disabled={isSaving}
              aria-label="Số lần xử lý lại tối đa"
              className="h-11 w-full text-sm"
              onChange={(event) =>
                onSettingsChange({
                  ...review,
                  maxRetries: Number(event.target.value) || 0,
                })
              }
            />
            <span className="block text-xs font-normal leading-5 text-text-secondary">
              0 = không xử lý lại. Tối đa 10 lần.
            </span>
          </label>
        ) : (
          <p className="text-sm font-medium text-text-primary">
            Cho phép xử lý lại tối đa {review.maxRetries} lần.
          </p>
        )}
      </div>
    );
  }

  return null;
}
