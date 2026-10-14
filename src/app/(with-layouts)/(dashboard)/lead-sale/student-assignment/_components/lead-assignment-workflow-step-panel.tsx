"use client";

import { Input } from "@/components/tailgrids/core/input";
import { Toggle } from "@/components/tailgrids/core/toggle";
import { Badge } from "@/components/tailgrids/core/badge";
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
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Tự động xử lý Lead đầu vào
            </h3>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Kiểm tra dữ liệu và trùng lặp của Lead mới trước khi phân công. Có
              thể bật riêng khi tắt tự động phân công.
            </p>
          </div>
          {canEdit ? (
            <Toggle
              aria-label="Tự động xử lý Lead đầu vào"
              size="md"
              checked={input.autoProcessEnabled}
              disabled={isSaving}
              onChange={(event) =>
                onSettingsChange({
                  ...input,
                  autoProcessEnabled: event.target.checked,
                })
              }
            />
          ) : (
            <Badge color="gray">
              {input.autoProcessEnabled ? "Bật" : "Tắt"}
            </Badge>
          )}
        </div>
        {canEdit ? (
          <div className="grid max-w-3xl items-end gap-3 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium text-text-primary">
              <span>Chu kỳ quét (phút)</span>
              <Input
                type="number"
                min={1}
                max={1440}
                value={String(input.scheduledMinAgeMinutes)}
                disabled={isSaving}
                aria-label="Chu kỳ quét tự động (phút)"
                className="h-11 w-full text-sm"
                onChange={(event) =>
                  onSettingsChange({
                    ...input,
                    scheduledMinAgeMinutes: Number(event.target.value) || 1,
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
            Chu kỳ quét: {input.scheduledMinAgeMinutes} phút · Tối đa{" "}
            {input.maxLeadsPerRun.toLocaleString("vi-VN")} Lead mỗi lượt.
          </p>
        )}
        <p className="text-xs leading-5 text-text-secondary">
          Chu kỳ và giới hạn này áp dụng cho tự động xử lý và tự động phân công.
          Khi bật cả hai, Lead mới được xử lý trước rồi Lead đủ điều kiện được
          phân công. Chạy thủ công không cần chờ chu kỳ quét.
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
