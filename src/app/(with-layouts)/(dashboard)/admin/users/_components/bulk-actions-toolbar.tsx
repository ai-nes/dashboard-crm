"use client";

import { Trash1 } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";

import RoleSelectDropdown from "./role-select-dropdown";

interface BulkActionsToolbarProps {
  selectedCount: number;
  isBusy: boolean;
  onChangeRole: (newRole: string) => void;
  onRemove: () => void;
  onClearSelection: () => void;
}

export default function BulkActionsToolbar({
  selectedCount,
  isBusy,
  onChangeRole,
  onRemove,
  onClearSelection,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-card-border bg-background-gray-secondary_alt px-4 py-3">
      <span className="text-sm font-medium text-text-primary">Đã chọn {selectedCount} người dùng</span>
      <div className="flex flex-wrap items-center gap-2">
        <RoleSelectDropdown value="" disabled={isBusy} onChange={onChangeRole} />
        <Button
          size="sm"
          variant="danger"
          appearance="outline"
          isDisabled={isBusy}
          onPress={onRemove}
        >
          <Trash1 size={16} aria-hidden="true" />
          Xoá khỏi CRM
        </Button>
        <Button size="sm" variant="ghost" appearance="ghost" isDisabled={isBusy} onPress={onClearSelection}>
          Bỏ chọn
        </Button>
      </div>
    </div>
  );
}
