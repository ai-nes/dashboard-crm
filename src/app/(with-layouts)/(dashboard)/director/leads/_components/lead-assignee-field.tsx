"use client";

import { toast } from "sonner";
import { useDeferredValue, useMemo, useState } from "react";

import { DropdownField } from "@/components/common/dropdown-field";
import {
  useAssignLeadMutation,
  useLeadAssignmentTargetsQuery,
} from "@/hooks/use-lead-sale-leads-queries";
import type {
  LeadDetail,
  LeadAssignmentTarget,
} from "@/services/api/lead-sale";

import { isLeadAssignableStatus } from "./lead-status";

interface LeadAssigneeFieldProps {
  lead: LeadDetail;
  leadId: string;
  canAssign?: boolean;
  isEditing?: boolean;
}

const EMPTY_TARGETS: LeadAssignmentTarget[] = [];

export default function LeadAssigneeField({
  lead,
  leadId,
  canAssign = false,
  isEditing = false,
}: LeadAssigneeFieldProps) {
  const assignmentReady =
    isLeadAssignableStatus(
      lead.processingStatus ?? lead.statusCode ?? lead.status,
    ) && !lead.studentId;
  const targetsQuery = useLeadAssignmentTargetsQuery(leadId, {
    enabled: canAssign && assignmentReady,
  });
  const assignMutation = useAssignLeadMutation();
  const targets = targetsQuery.data?.targets ?? EMPTY_TARGETS;
  const [selectedTargetKey, setSelectedTargetKey] = useState(() =>
    lead.ownerStaff && lead.owningTeam
      ? `${lead.owningTeam}:${lead.ownerStaff}`
      : "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const filteredTargets = useMemo(() => {
    const query = deferredSearchQuery.trim().toLocaleLowerCase("vi-VN");
    if (!query) return targets;
    return targets.filter((target) =>
      `${target.displayName} ${target.teamName} ${target.function}`
        .toLocaleLowerCase("vi-VN")
        .includes(query),
    );
  }, [deferredSearchQuery, targets]);
  const selectedTarget = targets.find(
    (target) => getTargetKey(target) === selectedTargetKey,
  );

  if (!canAssign || !assignmentReady) {
    return <ReadOnlyAssigneeField lead={lead} />;
  }

  const handleChange = (value: string) => {
    const target = targets.find((item) => getTargetKey(item) === value);
    if (!target) return;
    setSelectedTargetKey(value);

    assignMutation.mutate(
      {
        lead: leadId,
        ownerStaff: target.id,
        targetTeamId: target.teamId,
        expectedRevision:
          lead.ownershipRevision ?? targetsQuery.data?.ownershipRevision ?? 0,
        reason: "Phân công thủ công từ màn hình chi tiết Lead.",
      },
      {
        onSuccess: () => toast.success("Đã phân công Lead."),
        onError: (error) => {
          setSelectedTargetKey("");
          toast.error(
            error instanceof Error ? error.message : "Chưa thể phân công Lead.",
          );
        },
      },
    );
  };

  return (
    <div className="min-w-0">
      <dt className="text-xs leading-5 text-text-tertiary">Người phụ trách</dt>
      <DropdownField
        ariaLabel="Chọn Sale hoặc CTV phụ trách Lead"
        className="mt-1.5"
        contentClassName="max-h-64 min-w-72"
        emptyMessage={
          searchQuery ? "Không tìm thấy nhân viên" : "Chưa có Sale/CTV phù hợp"
        }
        errorMessage="Không thể tải danh sách"
        filterOptions={false}
        isDisabled={assignMutation.isPending}
        isError={targetsQuery.isError}
        isLoading={targetsQuery.isPending}
        isSearchable
        onChange={(value) => handleChange(String(value ?? ""))}
        onSearchChange={setSearchQuery}
        options={filteredTargets.map((target) => ({
          id: getTargetKey(target),
          label: target.displayName,
          description: `${target.function} · ${target.teamName}`,
          searchText: `${target.displayName} ${target.teamName} ${target.function}`,
        }))}
        placeholder={
          selectedTarget?.displayName ??
          (lead.ownerStaff
            ? lead.owner || lead.ownerStaff
            : targetsQuery.isPending
              ? "Đang tải..."
              : "Chưa có người phụ trách")
        }
        renderOption={(option) => (
          <span className="flex min-w-0 flex-col items-start gap-0.5">
            <span className="max-w-full truncate font-medium text-text-primary">
              {option.label}
            </span>
            <span className="max-w-full truncate text-xs text-text-tertiary">
              {option.description}
            </span>
          </span>
        )}
        selectedLabel={
          selectedTarget?.displayName ??
          (lead.ownerStaff ? lead.owner || lead.ownerStaff : undefined)
        }
        searchPlaceholder="Tìm Sale hoặc CTV"
        triggerClassName={
          isEditing
            ? "h-9 w-full min-w-0 px-3 py-2 text-sm"
            : "h-8 w-fit min-w-0 justify-start gap-1.5 rounded-md border-0 bg-transparent px-0 py-1 text-sm font-medium text-text-primary shadow-none hover:bg-transparent focus:ring-2 focus:ring-primary-500/25"
        }
        value={selectedTargetKey || undefined}
      />
      {targetsQuery.isError && (
        <p className="mt-1 text-xs text-text-tertiary">
          Không thể tải danh sách Sale/CTV. Vui lòng thử lại sau.
        </p>
      )}
      {!targetsQuery.isPending &&
        !targetsQuery.isError &&
        targets.length === 0 && (
          <p className="mt-1 text-xs text-text-tertiary">
            Lead cần có tỉnh và cơ sở, đồng thời Team phải đang sẵn sàng nhận
            Lead.
          </p>
        )}
    </div>
  );
}

function ReadOnlyAssigneeField({ lead }: { lead: LeadDetail }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs leading-5 text-text-tertiary">Người phụ trách</dt>
      <dd className="mt-1 text-sm font-medium leading-6 text-text-primary [overflow-wrap:anywhere]">
        {lead.ownerStaff
          ? lead.owner || lead.ownerStaff
          : "Chưa có người phụ trách"}
      </dd>
    </div>
  );
}

function getTargetKey(target: LeadAssignmentTarget): string {
  return `${target.teamId}:${target.id}`;
}
