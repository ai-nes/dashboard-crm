"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { cn } from "@/utils/cn";

type Props = {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  icon?: ReactNode;
  canEdit?: boolean;
  isDirty?: boolean;
  isSaving?: boolean;
  isBusy?: boolean;
  hasConflict?: boolean;
  saveError?: string;
  onRetry?: () => void;
  onReset?: () => void;
  onKeepDraft?: () => void;
};

export default function LeadAssignmentConfigSection({
  id,
  title,
  children,
  className,
  headerAction,
  icon,
  canEdit = false,
  isDirty = false,
  isSaving = false,
  isBusy = isSaving,
  hasConflict = false,
  saveError,
  onRetry,
  onReset,
  onKeepDraft,
}: Props) {
  return (
    <section
      id={`lead-config-${id}`}
      aria-labelledby={`lead-config-title-${id}`}
      className={cn(
        "min-w-0 space-y-4 rounded-xl border border-card-border bg-card-background p-5",
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h3
          id={`lead-config-title-${id}`}
          className="flex items-center gap-2.5 text-sm font-semibold text-text-primary"
        >
          {icon}
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Badge color="warning">
              {isSaving
                ? "Đang lưu…"
                : hasConflict || saveError
                  ? "Chưa lưu"
                  : "Chờ lưu…"}
            </Badge>
          )}
          {headerAction}
        </div>
      </header>
      {children}
      {canEdit && hasConflict && (
        <div
          role="alert"
          className="space-y-3 rounded-lg bg-badge-warning-background p-3 text-sm text-text-primary"
        >
          <p>Cấu hình vừa được người khác sửa. Chọn bản muốn giữ.</p>
          <div className="flex flex-wrap gap-2">
            <Button
              appearance="outline"
              size="sm"
              className="min-h-10"
              isDisabled={isBusy}
              onPress={onReset}
            >
              Dùng cấu hình mới
            </Button>
            <Button
              appearance="outline"
              size="sm"
              className="min-h-10"
              isDisabled={isBusy}
              onPress={onKeepDraft}
            >
              Giữ thay đổi của tôi
            </Button>
          </div>
        </div>
      )}
      {canEdit && saveError && (
        <div role="alert" className="space-y-3 text-sm text-badge-error-text">
          <p>{saveError}</p>
          <Button
            appearance="outline"
            size="sm"
            isDisabled={isBusy}
            onPress={onRetry}
          >
            Thử lại
          </Button>
        </div>
      )}
    </section>
  );
}
