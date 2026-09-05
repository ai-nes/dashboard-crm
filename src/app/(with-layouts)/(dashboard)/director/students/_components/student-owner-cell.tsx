"use client";

import { Pencil1, Search1 } from "@tailgrids/icons";
import { DialogTrigger, ListBox } from "react-aria-components";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/tailgrids/core/input-group";
import { Popover } from "@/components/tailgrids/core/popover";
import { SelectItem } from "@/components/tailgrids/core/select";
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

    try {
      await assignMutation.mutateAsync({
        studentId,
        ownerId: sale.name,
        reason: `Phân công thủ công cho ${sale.role || sale.profile || "Sale"}`,
        ...(expectedRevision !== undefined ? { expectedRevision } : {}),
        idempotencyKey: createRequestId("student-ownership", studentId),
        correlationId: createRequestId("manual-assign", studentId),
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
    <DialogTrigger
      isOpen={isEditing}
      onOpenChange={(open) => {
        setIsEditing(open);
        if (open) {
          setOwnerSearch("");
          setDebouncedOwnerSearch("");
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
          setDebouncedOwnerSearch("");
          setIsEditing(true);
        }}
        className="group/owner flex min-w-0 max-w-full items-center gap-1.5 truncate rounded px-1 py-0.5 text-left text-sm font-medium text-text-primary hover:bg-background-soft-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        aria-label={owner ? `Sửa người phụ trách: ${owner}` : "Thêm người phụ trách"}
      >
        <span className="truncate">{owner || "Chưa có người phụ trách"}</span>
        <Pencil1
          size={12}
          className="shrink-0 text-icon-tertiary opacity-0 transition group-hover/owner:opacity-100"
          aria-hidden="true"
        />
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
          {assignableSalesQuery.isError && (
            <div className="mt-1 flex items-center justify-between gap-2" role="alert">
              <span className="text-xs text-input-error">Không tải được danh sách</span>
              <Button
                type="button"
                size="xs"
                appearance="ghost"
                onPress={() => void assignableSalesQuery.refetch()}
              >
                Thử lại
              </Button>
            </div>
          )}
          {assignableSalesQuery.isFetching && (
            <span className="mt-1 block text-xs text-text-tertiary" role="status">
              Đang tìm…
            </span>
          )}
          <ListBox
            aria-label={`Danh sách Sale và CTV Sale có thể gán cho ${studentId}`}
            className="mt-1 max-h-64 overflow-auto p-1 outline-none"
            onAction={(key) => {
              const sale = sales.find((item) => item.name === String(key));
              if (sale) void handleAssign(sale);
            }}
          >
            {sales.length > 0 ? (
              sales.map((sale) => (
                <SelectItem key={sale.name} id={sale.name} textValue={sale.label}>
                  <span className="flex min-w-0 flex-col py-0.5">
                    <span className="truncate text-text-primary">{sale.label}</span>
                    <span className="truncate text-xs text-text-tertiary">
                      {sale.role || sale.profile}
                      {sale.campus ? ` · ${sale.campus}` : ""}
                    </span>
                  </span>
                </SelectItem>
              ))
            ) : (
              <SelectItem id="no-assignable-sales" isDisabled textValue="Không tìm thấy Sale hoặc CTV Sale">
                Không tìm thấy Sale hoặc CTV Sale
              </SelectItem>
            )}
          </ListBox>
        </div>
      </Popover>
    </DialogTrigger>
  );
}
