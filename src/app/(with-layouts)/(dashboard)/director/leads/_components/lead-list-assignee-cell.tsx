"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DropdownField } from "@/components/common/dropdown-field";
import {
  useAssignLeadMutation,
  useLeadAssignmentTargetsQuery,
} from "@/hooks/use-lead-sale-leads-queries";
import type {
  LeadAssignmentTarget,
  LeadListItem,
} from "@/services/api/lead-sale";

import { isLeadAssignableStatus } from "./lead-status";

interface LeadListAssigneeCellProps {
  lead: LeadListItem;
  canAssign?: boolean;
}

const EMPTY_TARGETS: LeadAssignmentTarget[] = [];

export default function LeadListAssigneeCell({
  lead,
  canAssign = false,
}: LeadListAssigneeCellProps) {
  const assignmentReady =
    isLeadAssignableStatus(
      lead.statusCode ?? lead.processingStatus ?? lead.status,
    ) && !lead.studentId;
  const [isEditing, setIsEditing] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [optimisticOwner, setOptimisticOwner] = useState<{
    leadId: string;
    label: string;
  } | null>(null);
  const displayOwner =
    optimisticOwner?.leadId === lead.id ? optimisticOwner.label : lead.owner;

  const targetsQuery = useLeadAssignmentTargetsQuery(lead.id, {
    enabled: canAssign && assignmentReady && isEditing,
    placeholderData: (previous) => previous,
  });
  const assignMutation = useAssignLeadMutation();
  const targets = targetsQuery.data?.targets ?? EMPTY_TARGETS;
  const normalizedSearch = ownerSearch.trim().toLocaleLowerCase("vi-VN");
  const filteredTargets = useMemo(
    () =>
      normalizedSearch
        ? targets.filter((target) =>
            `${target.displayName} ${target.teamName} ${target.function}`
              .toLocaleLowerCase("vi-VN")
              .includes(normalizedSearch),
          )
        : targets,
    [normalizedSearch, targets],
  );

  const handleAssign = async (target: LeadAssignmentTarget) => {
    const expectedRevision =
      lead.ownershipRevision ?? targetsQuery.data?.ownershipRevision;
    if (expectedRevision === undefined) {
      toast.error("Thiếu phiên bản phân công; hãy tải lại danh sách Lead.");
      return;
    }
    if (target.id === lead.ownerStaff && target.teamId === lead.owningTeam) {
      setIsEditing(false);
      return;
    }

    try {
      await assignMutation.mutateAsync({
        lead: lead.id,
        ownerStaff: target.id,
        targetTeamId: target.teamId,
        expectedRevision,
        reason: "Phân công thủ công từ danh sách Lead.",
      });
      setOptimisticOwner({ leadId: lead.id, label: target.displayName });
      setIsEditing(false);
      toast.success("Đã cập nhật người phụ trách Lead.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Chưa thể cập nhật người phụ trách Lead.",
      );
    }
  };

  if (!canAssign || !assignmentReady) {
    return <OwnerValue owner={displayOwner} />;
  }

  const currentTarget = targets.find(
    (target) =>
      target.id === lead.ownerStaff && target.teamId === lead.owningTeam,
  );

  return (
    <DropdownField
      ariaLabel={
        displayOwner
          ? `Sửa người phụ trách: ${displayOwner}`
          : "Thêm người phụ trách"
      }
      appearance="ghost"
      className="w-full"
      contentClassName="w-72"
      emptyMessage="Không tìm thấy Sale hoặc CTV Sale"
      errorMessage={
        <span className="flex items-center justify-between gap-2">
          <span>Không tải được danh sách</span>
          <button
            type="button"
            className="text-xs font-medium text-button-primary-outline-text hover:text-button-primary-outline-hover-text"
            onClick={() => void targetsQuery.refetch()}
          >
            Thử lại
          </button>
        </span>
      }
      filterOptions={false}
      isDisabled={assignMutation.isPending}
      isError={targetsQuery.isError}
      isLoading={targetsQuery.isFetching}
      isOpen={isEditing}
      isSearchable
      onChange={(nextValue) => {
        const target = filteredTargets.find(
          (item) => getTargetKey(item) === nextValue,
        );
        if (target) void handleAssign(target);
      }}
      onOpenChange={(open) => {
        setIsEditing(open);
        if (open) setOwnerSearch("");
      }}
      onSearchChange={setOwnerSearch}
      options={filteredTargets.map((target) => ({
        id: getTargetKey(target),
        label: target.displayName,
        description: `${target.function} · ${target.teamName}`,
        searchText: `${target.displayName} ${target.teamName} ${target.function}`,
      }))}
      placeholder={displayOwner || "Chưa phân công"}
      renderOption={(option) => (
        <span className="flex min-w-0 flex-col py-0.5">
          <span className="truncate text-text-primary">{option.label}</span>
          <span className="truncate text-xs text-text-tertiary">
            {option.description}
          </span>
        </span>
      )}
      selectedLabel={displayOwner || "Chưa phân công"}
      searchPlaceholder="Tìm Sale hoặc CTV Sale"
      triggerClassName="group/owner flex min-w-0 max-w-full truncate rounded px-1 py-0.5 text-left text-sm font-medium text-text-primary hover:bg-background-soft-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      value={currentTarget ? getTargetKey(currentTarget) : undefined}
    />
  );
}

function OwnerValue({ owner }: { owner: string }) {
  return (
    <p
      className="truncate text-sm font-medium text-text-primary"
      title={owner || undefined}
    >
      {owner || "Chưa phân công"}
    </p>
  );
}

function getTargetKey(target: LeadAssignmentTarget): string {
  return `${target.teamId}:${target.id}`;
}
