"use client";

import { DialogTrigger, ListBox } from "react-aria-components";
import { Search1 } from "@tailgrids/icons";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { Popover } from "@/components/tailgrids/core/popover";
import { SelectItem } from "@/components/tailgrids/core/select";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import {
  useAssignLeadMutation,
  useLeadAssignmentTargetsQuery,
} from "@/hooks/use-lead-sale-leads-queries";
import type { LeadAssignmentTarget, LeadListItem } from "@/services/api/lead-sale";

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

  return (
    <DialogTrigger
      isOpen={isEditing}
      onOpenChange={(open) => {
        setIsEditing(open);
        if (open) {
          setOwnerSearch("");
        }
      }}
    >
      <Button
        type="button"
        variant="ghost"
        appearance="ghost"
        size="xs"
        onPress={() => {
          setOwnerSearch("");
          setIsEditing(true);
        }}
        className="group/owner flex min-w-0 max-w-full truncate rounded px-1 py-0.5 text-left text-sm font-medium text-text-primary hover:bg-background-soft-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        aria-label={
          displayOwner
            ? `Sửa người phụ trách: ${displayOwner}`
            : "Thêm người phụ trách"
        }
        isDisabled={assignMutation.isPending}
      >
        <span className="truncate">{displayOwner || "Chưa phân công"}</span>
      </Button>
      <Popover className="w-72 overflow-hidden rounded-lg border border-card-border bg-background-white-secondary p-0 shadow-md">
        <div className="p-2">
          <InputGroup className="h-8">
            <InputGroupAddon className="px-2">
              <Search1 size={13} aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              className="h-8 px-2 py-1.5 text-xs"
              value={ownerSearch}
              onChange={(event) => setOwnerSearch(event.target.value)}
              placeholder="Tìm kiếm"
              autoFocus
              aria-label="Tìm Sale hoặc CTV Sale"
            />
          </InputGroup>
          {targetsQuery.isError && (
            <div
              className="mt-1 flex items-center justify-between gap-2"
              role="alert"
            >
              <span className="text-xs text-input-error">
                Không tải được danh sách
              </span>
              <Button
                type="button"
                size="xs"
                appearance="ghost"
                onPress={() => void targetsQuery.refetch()}
              >
                Thử lại
              </Button>
            </div>
          )}
          {targetsQuery.isFetching ? (
            <OwnerOptionsSkeleton />
          ) : (
            <ListBox
              aria-label={`Danh sách Sale và CTV Sale có thể gán cho ${lead.name}`}
              className="mt-1 max-h-64 overflow-auto p-1 outline-none"
              onAction={(key) => {
                const target = filteredTargets.find(
                  (item) => getTargetKey(item) === String(key),
                );
                if (target) void handleAssign(target);
              }}
            >
              {filteredTargets.length > 0 ? (
                filteredTargets.map((target) => (
                  <SelectItem
                    key={getTargetKey(target)}
                    id={getTargetKey(target)}
                    textValue={`${target.displayName} ${target.teamName} ${target.function}`}
                  >
                    <span className="flex min-w-0 flex-col py-0.5">
                      <span className="truncate text-text-primary">
                        {target.displayName}
                      </span>
                      <span className="truncate text-xs text-text-tertiary">
                        {target.function} · {target.teamName}
                      </span>
                    </span>
                  </SelectItem>
                ))
              ) : (
                <SelectItem
                  id="no-assignable-targets"
                  isDisabled
                  textValue="Không tìm thấy Sale hoặc CTV Sale"
                >
                  Không tìm thấy Sale hoặc CTV Sale
                </SelectItem>
              )}
            </ListBox>
          )}
        </div>
      </Popover>
    </DialogTrigger>
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

function OwnerOptionsSkeleton() {
  return (
    <div
      className="mt-1 space-y-2 p-2"
      role="status"
      aria-label="Đang tải danh sách người phụ trách"
    >
      {["first", "second", "third"].map((row) => (
        <div key={row} className="space-y-2 rounded-md px-1.5 py-1">
          <Skeleton className="h-3 w-40 max-w-full" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      ))}
    </div>
  );
}

function getTargetKey(target: LeadAssignmentTarget): string {
  return `${target.teamId}:${target.id}`;
}
