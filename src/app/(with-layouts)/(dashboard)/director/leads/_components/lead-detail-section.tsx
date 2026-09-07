import { Pencil1 } from "@tailgrids/icons";
import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { cn } from "@/utils/cn";

interface LeadDetailSectionProps {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  isEditing?: boolean;
  canEdit?: boolean;
  isSaving?: boolean;
  editLabel?: string;
  onEdit?: () => void;
  onCancel?: () => void;
  onSave?: (event: FormEvent<HTMLFormElement>) => void;
}

export default function LeadDetailSection({
  title,
  description,
  icon,
  children,
  className,
  isEditing = false,
  canEdit = true,
  isSaving = false,
  editLabel = "Chỉnh sửa thông tin Lead",
  onEdit,
  onCancel,
  onSave,
}: LeadDetailSectionProps) {
  const content = (
    <section aria-label={title}>
      <header className="mb-6 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background-gray-secondary text-text-secondary"
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
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
          ) : canEdit && onEdit ? (
            <Button
              aria-label={editLabel}
              iconOnly
              onPress={onEdit}
              size="sm"
              variant="ghost"
            >
              <Pencil1 size={16} aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );

  return (
    <Card className={cn("min-w-0 rounded-2xl p-4 sm:p-5", className)}>
      {isEditing && onSave ? <form onSubmit={onSave}>{content}</form> : content}
    </Card>
  );
}
