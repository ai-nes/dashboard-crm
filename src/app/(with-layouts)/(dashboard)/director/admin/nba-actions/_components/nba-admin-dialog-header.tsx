import type { ReactNode } from "react";

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";

interface NbaAdminDialogHeaderProps {
  code: string;
  title: string;
  description: string;
  canEdit: boolean;
  status?: ReactNode;
  rightLabel?: string;
}

export default function NbaAdminDialogHeader({
  code,
  title,
  description,
  canEdit,
  status,
  rightLabel,
}: NbaAdminDialogHeaderProps) {
  return (
    <DialogHeader className="gap-1.5 border-b border-card-border px-5 py-3.5 pr-12">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-semibold tracking-[0.06em] text-primary-500">
            {code}
          </span>
          {status}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-text-tertiary">
          <span className="size-1.5 rounded-full bg-primary-500" aria-hidden="true" />
          {rightLabel ?? (canEdit ? "Có thể chỉnh sửa" : "Chỉ xem")}
        </span>
      </div>
      <DialogTitle className="text-[17px] leading-6">{title}</DialogTitle>
      <DialogDescription className="text-[13px] leading-5 text-text-tertiary">
        {description}
      </DialogDescription>
    </DialogHeader>
  );
}
