"use client";

import { toast } from "sonner";

import {
  ADMIN_STATUS_SELECT_CONTENT_CLASS,
  ADMIN_STATUS_SELECT_INDICATOR_CLASS,
  ADMIN_STATUS_SELECT_TRIGGER_CLASS,
} from "@/components/common/admin/admin-status-select-styles";
import { Badge } from "@/components/tailgrids/core/badge";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { useUpdateCrmRuleVersionMutation } from "@/hooks/use-rules-config-queries";
import type {
  CrmRuleStatus,
  CrmRuleVersion,
} from "@/services/api/rules-config";
import { cn } from "@/utils/cn";

const STATUS_LABELS: Record<CrmRuleStatus, string> = {
  draft: "Bản nháp",
  testing: "Đang kiểm thử",
  active: "Đang hoạt động",
  archived: "Đã lưu trữ",
};

const STATUS_BADGE_COLORS: Record<
  CrmRuleStatus,
  "gray" | "success" | "warning" | "primary"
> = {
  draft: "warning",
  testing: "primary",
  active: "success",
  archived: "gray",
};

const STATUS_SELECT_STYLES: Record<CrmRuleStatus, string> = {
  draft:
    "border-transparent bg-badge-warning-background text-badge-warning-text hover:bg-badge-warning-background",
  testing:
    "border-transparent bg-badge-primary-background text-badge-primary-text hover:bg-badge-primary-background",
  active:
    "border-transparent bg-badge-success-background text-badge-success-text hover:bg-badge-success-background",
  archived:
    "border-transparent bg-badge-neutral-background text-badge-neutral-text hover:bg-badge-neutral-background",
};

interface RuleVersionStatusSelectProps {
  version: CrmRuleVersion;
  canEdit: boolean;
  onChanged: (version: CrmRuleVersion) => void;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Không thể cập nhật trạng thái Version.";
}

export function RuleVersionStatusSelect({
  version,
  canEdit,
  onChanged,
}: RuleVersionStatusSelectProps) {
  const statusMutation = useUpdateCrmRuleVersionMutation();
  const isBusy = statusMutation.isPending;

  const options: CrmRuleStatus[] =
    version.status === "draft"
      ? ["draft", "testing"]
      : version.status === "testing"
        ? ["testing", "draft", "active"]
        : version.status === "archived"
          ? ["archived"]
          : ["active"];

  const changeStatus = async (nextStatus: CrmRuleStatus) => {
    if (nextStatus === version.status || isBusy) return;

    try {
      if (nextStatus === "active" && version.status === "testing") {
        const updated = await statusMutation.mutateAsync({
          name: version.name,
          expectedRevision: version.revision,
          status: nextStatus,
          expectedSettingsRevision: version.settingsRevision,
        });
        toast.success("Đã kích hoạt Version.");
        onChanged(updated);
        return;
      }
      if (nextStatus === "testing" || nextStatus === "draft") {
        const updated = await statusMutation.mutateAsync({
          name: version.name,
          expectedRevision: version.revision,
          status: nextStatus,
        });
        toast.success(nextStatus === "testing" ? "Đã chuyển Version sang kiểm thử." : "Đã đưa Version về bản nháp.");
        onChanged(updated);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Select
      aria-label={`Cập nhật trạng thái ${version.versionName}`}
      isDisabled={!canEdit || isBusy}
      className="w-fit gap-0"
      value={version.status}
      onChange={(nextValue) => void changeStatus(nextValue as CrmRuleStatus)}
    >
      <SelectTrigger
        appearance="ghost"
        size="sm"
        className={cn(
          ADMIN_STATUS_SELECT_TRIGGER_CLASS,
          STATUS_SELECT_STYLES[version.status],
        )}
      >
        <SelectValue className="max-w-none text-inherit">
          {STATUS_LABELS[version.status]}
        </SelectValue>
        <SelectIndicator className={ADMIN_STATUS_SELECT_INDICATOR_CLASS} />
      </SelectTrigger>
      <SelectContent className={ADMIN_STATUS_SELECT_CONTENT_CLASS}>
        {options.map((option) => (
          <SelectItem
            key={option}
            id={option}
            textValue={STATUS_LABELS[option]}
          >
            <Badge color={STATUS_BADGE_COLORS[option]}>
              {STATUS_LABELS[option]}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
