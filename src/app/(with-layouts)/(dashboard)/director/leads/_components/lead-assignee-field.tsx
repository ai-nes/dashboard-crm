"use client";

import { Search1 } from "@tailgrids/icons";
import { toast } from "sonner";
import { useDeferredValue, useMemo, useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import {
  useAssignLeadMutation,
  useLeadAssignmentTargetsQuery,
} from "@/hooks/use-lead-sale-leads-queries";
import type { LeadDetail, LeadAssignmentTarget } from "@/services/api/lead-sale";

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
            error instanceof Error
              ? error.message
              : "Chưa thể phân công Lead.",
          );
        },
      },
    );
  };

  return (
    <div className="min-w-0">
      <dt className="text-xs leading-5 text-text-tertiary">Người phụ trách</dt>
      <Select
        aria-label="Chọn Sale hoặc CTV phụ trách Lead"
        className="mt-1.5 gap-0"
        isDisabled={assignMutation.isPending}
        onChange={(value) => handleChange(String(value ?? ""))}
        value={selectedTargetKey || undefined}
      >
        <SelectTrigger
          appearance={isEditing ? "outline" : "ghost"}
          className={
            isEditing
              ? "h-9 w-full min-w-0 px-3 py-2 text-sm"
              : "h-8 w-fit min-w-0 justify-start gap-1.5 rounded-md border-0 bg-transparent px-0 py-1 text-sm font-medium text-text-primary shadow-none hover:bg-transparent focus:ring-2 focus:ring-primary-500/25"
          }
        >
          <SelectValue>
            {selectedTarget?.displayName ??
              (lead.ownerStaff
                ? lead.owner || lead.ownerStaff
                : targetsQuery.isPending
                  ? "Đang tải..."
                  : "Chưa có người phụ trách")}
          </SelectValue>
          {isEditing && <SelectIndicator />}
        </SelectTrigger>
        <SelectContent
          className="max-h-64 min-w-72"
          header={
            <div className="sticky top-0 z-10 border-b border-card-border bg-background-white-secondary p-2">
              <InputGroup className="h-8 rounded-md">
                <InputGroupAddon className="px-2 text-text-tertiary">
                  <Search1 size={14} aria-hidden="true" />
                </InputGroupAddon>
                <InputGroupInput
                  autoFocus
                  aria-label="Tìm Sale hoặc CTV"
                  className="h-8 py-1 text-base"
                  placeholder="Tìm kiếm"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </InputGroup>
            </div>
          }
          onOpenChange={(open) => {
            if (!open) setSearchQuery("");
          }}
        >
          {targetsQuery.isPending && (
            <SelectItem id="assignment-loading" isDisabled>
              Đang tải danh sách...
            </SelectItem>
          )}
          {!targetsQuery.isPending && targetsQuery.isError && (
            <SelectItem id="assignment-error" isDisabled>
              Không thể tải danh sách
            </SelectItem>
          )}
          {!targetsQuery.isPending &&
            !targetsQuery.isError &&
            filteredTargets.length === 0 && (
              <SelectItem id="assignment-empty" isDisabled>
                {searchQuery ? "Không tìm thấy nhân viên" : "Chưa có Sale/CTV phù hợp"}
              </SelectItem>
            )}
          {filteredTargets.map((target) => (
            <SelectItem
              key={getTargetKey(target)}
              id={getTargetKey(target)}
              textValue={`${target.displayName} ${target.teamName} ${target.function}`}
            >
              <AssignmentTargetOption target={target} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {targetsQuery.isError && (
        <p className="mt-1 text-xs text-text-tertiary">
          Không thể tải danh sách Sale/CTV. Vui lòng thử lại sau.
        </p>
      )}
      {!targetsQuery.isPending &&
        !targetsQuery.isError &&
        targets.length === 0 && (
          <p className="mt-1 text-xs text-text-tertiary">
            Lead cần có tỉnh và cơ sở, đồng thời Team phải đang sẵn sàng nhận Lead.
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
        {lead.ownerStaff ? lead.owner || lead.ownerStaff : "Chưa có người phụ trách"}
      </dd>
    </div>
  );
}

function AssignmentTargetOption({ target }: { target: LeadAssignmentTarget }) {
  return (
    <span className="flex min-w-0 flex-col items-start gap-0.5">
      <span className="max-w-full truncate font-medium text-text-primary">
        {target.displayName}
      </span>
      <span className="max-w-full truncate text-xs text-text-tertiary">
        {target.function} · {target.teamName}
      </span>
    </span>
  );
}

function getTargetKey(target: LeadAssignmentTarget): string {
  return `${target.teamId}:${target.id}`;
}
