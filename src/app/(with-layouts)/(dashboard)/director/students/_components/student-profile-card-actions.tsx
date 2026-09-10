"use client";

import { Pencil1 } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";

interface StudentProfileCardActionsProps {
  canEdit: boolean;
  isEditing: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onEdit: () => void;
}

export default function StudentProfileCardActions({
  canEdit,
  isEditing,
  isSaving,
  onCancel,
  onEdit,
}: StudentProfileCardActionsProps) {
  if (!isEditing) {
    if (!canEdit) return null;

    return (
      <Button
        appearance="outline"
        aria-label="Chỉnh sửa thông tin"
        onPress={onEdit}
        size="sm"
      >
        <Pencil1 size={15} aria-hidden="true" />
        Chỉnh sửa
      </Button>
    );
  }

  return (
    <>
      <Button
        appearance="outline"
        isDisabled={isSaving}
        onPress={onCancel}
        size="sm"
        type="button"
      >
        Hủy
      </Button>
      <Button isDisabled={isSaving} size="sm" type="submit">
        {isSaving ? "Đang lưu…" : "Lưu"}
      </Button>
    </>
  );
}
