"use client";

import { Toggle } from "@/components/tailgrids/core/toggle";
import type { LeadAssignmentWorkflowStepSnapshot } from "@/services/api/lead-sale";

type Props = {
  configuration: LeadAssignmentWorkflowStepSnapshot;
  canEdit: boolean;
  isSaving: boolean;
  onSettingsChange: (settings: Record<string, unknown>) => void;
};

export default function LeadAssignmentStepToggle({
  configuration,
  canEdit,
  isSaving,
  onSettingsChange,
}: Props) {
  if (!canEdit || !configuration.canToggle) return null;
  return (
    <Toggle
      size="md"
      aria-label={
        configuration.id === "input"
          ? "Tự động tiếp nhận Lead mới"
          : "Kiểm tra lại kết quả xử lý Lead"
      }
      checked={configuration.enabled}
      disabled={isSaving}
      onChange={(event) =>
        onSettingsChange({
          ...configuration.settings,
          enabled: event.target.checked,
        })
      }
    />
  );
}
