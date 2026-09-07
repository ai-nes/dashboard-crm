"use client";

import { Check, Close, ExpandSquare4, FolderPlus } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import { cn } from "@/utils/cn";

import { useTaskDialog } from "./task-create-dialog-shell";

export interface TaskDialogHeaderProps {
  breadcrumbContext?: string;
  taskKey?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onClose?: () => void;
  className?: string;
}

export default function TaskDialogHeader({
  breadcrumbContext = "Hồ sơ học sinh",
  taskKey = "Task mới",
  isFullscreen: propIsFullscreen,
  onToggleFullscreen: propOnToggleFullscreen,
  onClose: propOnClose,
  className,
}: TaskDialogHeaderProps) {
  const dialogContext = useTaskDialog();

  const isFullscreen =
    propIsFullscreen !== undefined
      ? propIsFullscreen
      : (dialogContext?.isFullscreen ?? false);
  const onToggleFullscreen =
    propOnToggleFullscreen ?? dialogContext?.toggleFullscreen;
  const onClose = propOnClose ?? dialogContext?.close ?? (() => {});

  return (
    <header
      className={cn(
        "flex shrink-0 items-center justify-between border-b border-card-border px-4 py-2.5 sm:px-6 text-text-secondary",
        className,
      )}
    >
      {/* Breadcrumb bên trái */}
      <div className="flex min-w-0 items-center gap-2 text-xs sm:text-sm">
        <div
          className="flex items-center gap-1.5 font-medium text-text-secondary"
          title={breadcrumbContext}
        >
          <FolderPlus
            size={15}
            aria-hidden="true"
            className="shrink-0 text-text-tertiary"
          />
          <span className="truncate max-w-[140px] sm:max-w-[200px]">
            {breadcrumbContext}
          </span>
        </div>

        <span className="text-text-tertiary" aria-hidden="true">
          /
        </span>

        <div className="flex items-center gap-1.5 font-semibold text-text-primary">
          <span
            className="flex size-4 items-center justify-center rounded-[3px] bg-primary-500 text-white-100"
            aria-hidden="true"
          >
            <Check size={11} />
          </span>
          <span className="truncate max-w-[140px] sm:max-w-[220px]">
            {taskKey}
          </span>
        </div>
      </div>

      {/* Action toolbar bên phải: Chỉ giữ phóng to & đóng */}
      <div className="flex items-center gap-1">
        {onToggleFullscreen && (
          <Button
            appearance="ghost"
            variant="ghost"
            size="xs"
            iconOnly
            aria-label={isFullscreen ? "Thu nhỏ màn hình" : "Mở toàn màn hình"}
            className="size-8 rounded-md text-text-secondary hover:bg-background-soft-100 hover:text-text-primary"
            onPress={onToggleFullscreen}
          >
            <ExpandSquare4 size={15} />
          </Button>
        )}

        <Button
          appearance="ghost"
          variant="ghost"
          size="xs"
          iconOnly
          aria-label="Đóng"
          className="size-8 rounded-md text-text-secondary hover:bg-background-soft-100 hover:text-text-primary"
          onPress={onClose}
        >
          <Close size={16} />
        </Button>
      </div>
    </header>
  );
}
