"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DropdownField } from "@/components/common/dropdown-field";
import { Button } from "@/components/tailgrids/core/button";
import {
  useAssignStudentToSalesMutation,
  useAssignableSalesQuery,
} from "@/hooks/use-student-ownership-queries";
import type { AssignableSale } from "@/services/api/student-ownership";

interface StudentOwnerCellProps {
  studentId: string;
  expectedRevision?: number;
  owner: string;
  editable: boolean;
  onChange: (owner: string) => void;
}

function createRequestId(prefix: string, studentId: string): string {
  const suffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Date.now().toString(36);

  return `${prefix}:${studentId}:${suffix}`;
}

export default function StudentOwnerCell({
  studentId,
  expectedRevision,
  owner,
  editable,
  onChange,
}: StudentOwnerCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [debouncedOwnerSearch, setDebouncedOwnerSearch] = useState("");
  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedOwnerSearch(ownerSearch.trim()),
      250,
    );
    return () => window.clearTimeout(timeoutId);
  }, [ownerSearch]);

  const assignableSalesQuery = useAssignableSalesQuery(
    studentId,
    debouncedOwnerSearch,
    {
      enabled: isEditing,
      placeholderData: (previous) => previous,
    },
  );
  const assignMutation = useAssignStudentToSalesMutation();
  const sales = assignableSalesQuery.data?.sales ?? [];
  const currentOwnerId = sales.find(
    (sale) => sale.name === owner || sale.label === owner,
  )?.name;

  const handleAssign = async (sale: AssignableSale) => {
    if (sale.name === currentOwnerId || sale.label === owner) {
      setIsEditing(false);
      return;
    }
    if (expectedRevision === undefined) {
      toast.error(
        "Thiếu phiên bản ownership; hãy tải lại danh sách trước khi phân công.",
      );
      return;
    }

    try {
      await assignMutation.mutateAsync({
        studentId,
        ownerId: sale.name,
        reason: `Phân công thủ công cho ${sale.role || sale.profile || "Sale"}`,
        expectedRevision,
        idempotencyKey: createRequestId("student-ownership", studentId),
        correlationId: createRequestId("manual-assign", studentId),
        targetTeamId: sale.team,
      });
      onChange(sale.label);
      setIsEditing(false);
      toast.success("Đã cập nhật người phụ trách.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Chưa thể cập nhật người phụ trách.",
      );
    }
  };

  if (!editable) {
    return (
      <p
        className="truncate text-sm font-medium text-text-primary"
        title={owner || undefined}
      >
        {owner || "-"}
      </p>
    );
  }

  return (
    <DropdownField
      ariaLabel={
        owner ? `Sửa người phụ trách: ${owner}` : "Thêm người phụ trách"
      }
      appearance="ghost"
      className="w-full"
      contentClassName="w-72"
      emptyMessage="Không tìm thấy Sale hoặc CTV Sale"
      errorMessage={
        <span className="flex items-center justify-between gap-2">
          <span>Không tải được danh sách</span>
          <Button
            type="button"
            size="xs"
            appearance="ghost"
            onPress={() => void assignableSalesQuery.refetch()}
          >
            Thử lại
          </Button>
        </span>
      }
      isDisabled={assignMutation.isPending}
      isError={assignableSalesQuery.isError}
      isLoading={assignableSalesQuery.isFetching}
      isOpen={isEditing}
      isSearchable
      onChange={(nextValue) => {
        const sale = sales.find((item) => item.name === nextValue);
        if (sale) void handleAssign(sale);
      }}
      onOpenChange={(open) => {
        setIsEditing(open);
        if (open) {
          setOwnerSearch("");
          setDebouncedOwnerSearch("");
        }
      }}
      onSearchChange={setOwnerSearch}
      options={sales.map((sale) => ({
        id: sale.name,
        label: sale.label,
        description: [sale.role || sale.profile, sale.campus]
          .filter(Boolean)
          .join(" · "),
        searchText: `${sale.label} ${sale.role || ""} ${sale.profile || ""} ${sale.campus || ""}`,
      }))}
      placeholder={owner || "Chưa có người phụ trách"}
      renderOption={(option) => (
        <span className="flex min-w-0 flex-col py-0.5">
          <span className="truncate text-text-primary">{option.label}</span>
          <span className="truncate text-xs text-text-tertiary">
            {option.description}
          </span>
        </span>
      )}
      selectedLabel={owner || "Chưa có người phụ trách"}
      searchPlaceholder="Tìm Sale hoặc CTV Sale"
      triggerClassName="group/owner flex min-w-0 max-w-full items-center gap-1.5 truncate rounded px-1 py-0.5 text-left text-sm font-medium text-text-primary hover:bg-background-soft-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      value={currentOwnerId}
    />
  );
}
