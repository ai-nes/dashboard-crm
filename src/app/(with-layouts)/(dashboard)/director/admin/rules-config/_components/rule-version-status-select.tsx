"use client";

import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { usePublishCrmRuleVersionMutation } from "@/hooks/use-rules-config-queries";
import type {
  CrmRuleStatus,
  CrmRuleVersion,
} from "@/services/api/rules-config";
import { cn } from "@/utils/cn";

const STATUS_LABELS: Record<CrmRuleStatus, string> = {
  draft: "Bản nháp",
  published: "Đã phát hành",
  archived: "Đã lưu trữ",
};

const STATUS_BADGE_COLORS: Record<
  CrmRuleStatus,
  "gray" | "success" | "warning"
> = {
  draft: "warning",
  published: "success",
  archived: "gray",
};

const STATUS_SELECT_STYLES: Record<CrmRuleStatus, string> = {
  draft:
    "border-transparent bg-badge-warning-background text-badge-warning-text hover:bg-badge-warning-background",
  published:
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
  const publishMutation = usePublishCrmRuleVersionMutation();
  const isBusy = publishMutation.isPending;

  const options: CrmRuleStatus[] =
    version.status === "draft"
      ? ["draft", "published"]
      : version.status === "archived"
        ? ["archived", "published"]
        : ["published"];

  const changeStatus = async (nextStatus: CrmRuleStatus) => {
    if (nextStatus === version.status || isBusy) return;

    try {
      if (nextStatus === "published") {
        const updated = await publishMutation.mutateAsync({
          name: version.name,
          expectedRevision: version.revision,
        });
        toast.success("Đã phát hành toàn bộ Version.");
        onChanged(updated);
        return;
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
        className={cn(
          "h-10 w-40 justify-between rounded-xl border-0 px-3.5 py-2 text-base font-medium shadow-none outline-none data-[focused=true]:ring-4 data-[focused=true]:ring-button-outline-focus-ring",
          STATUS_SELECT_STYLES[version.status],
        )}
      >
        <SelectValue className="max-w-none text-inherit">
          {STATUS_LABELS[version.status]}
        </SelectValue>
        <SelectIndicator className="text-inherit" />
      </SelectTrigger>
      <SelectContent className="min-w-40">
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
