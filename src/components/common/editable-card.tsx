"use client";

import { Pencil1 } from "@tailgrids/icons";
import type { ReactNode, FormEvent } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { cn } from "@/utils/cn";

interface EditableCardProps {
  title: string;
  editLabel: string;
  isEditing: boolean;
  canEdit?: boolean;
  isSaving?: boolean;
  headerContent?: ReactNode;
  children: ReactNode;
  className?: string;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
}

interface EditableCardHeaderProps {
  title: string;
  editLabel: string;
  isEditing: boolean;
  canEdit: boolean;
  isSaving: boolean;
  headerContent?: ReactNode;
  onEdit: () => void;
  onCancel: () => void;
}

function EditableCardHeader({
  title,
  editLabel,
  isEditing,
  canEdit,
  isSaving,
  headerContent,
  onEdit,
  onCancel,
}: EditableCardHeaderProps) {
  return (
    <CardHeader className="mb-5">
      <CardTitle>{title}</CardTitle>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {headerContent}
        {isEditing ? (
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
        ) : canEdit ? (
          <Button
            aria-label={editLabel}
            className="opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            iconOnly
            onPress={onEdit}
            size="sm"
            variant="ghost"
          >
            <Pencil1 size={16} aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </CardHeader>
  );
}

export function EditableCard({
  title,
  editLabel,
  isEditing,
  canEdit = true,
  isSaving = false,
  headerContent,
  children,
  className,
  onEdit,
  onCancel,
  onSave,
}: EditableCardProps) {
  return (
    <Card className={cn("group p-5", className)}>
      {isEditing ? (
        <form onSubmit={onSave}>
          <EditableCardHeader
            editLabel={editLabel}
            headerContent={headerContent}
            isEditing
            canEdit={canEdit}
            isSaving={isSaving}
            onCancel={onCancel}
            onEdit={onEdit}
            title={title}
          />
          {children}
        </form>
      ) : (
        <>
          <EditableCardHeader
            editLabel={editLabel}
            headerContent={headerContent}
            isEditing={false}
            canEdit={canEdit}
            isSaving={isSaving}
            onCancel={onCancel}
            onEdit={onEdit}
            title={title}
          />
          {children}
        </>
      )}
    </Card>
  );
}
