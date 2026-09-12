import type { ReactNode } from "react";

import { Badge } from "@/components/tailgrids/core/badge";

interface AdminPageHeaderProps {
  section: string;
  title: ReactNode;
  description: ReactNode;
  canEdit?: boolean;
  before?: ReactNode;
  details?: ReactNode;
  metaLabel?: ReactNode;
  metaValue?: ReactNode;
  actions?: ReactNode;
}

/** Shared header for the administration workspace and its configuration screens. */
export default function AdminPageHeader({
  section,
  title,
  description,
  canEdit = true,
  before,
  details,
  metaLabel,
  metaValue,
  actions,
}: AdminPageHeaderProps) {
  const hasMeta = metaLabel !== undefined || metaValue !== undefined;

  return (
    <header className="shrink-0">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,auto)] lg:items-end">
        <div className="min-w-0 max-w-3xl">
          {before ? <div className="mb-3">{before}</div> : null}
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-primary-500">
            <span className="size-2 rounded-full bg-primary-500" aria-hidden="true" />
            <span>{section}</span>
            <Badge color={canEdit ? "success" : "gray"}>
              {canEdit ? "Administrator" : "Chỉ xem"}
            </Badge>
          </div>
          <h1 className="mt-2 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
          {details ? <div className="mt-3">{details}</div> : null}
        </div>

        {actions || hasMeta ? (
          <div className="flex flex-col gap-2 text-sm text-text-secondary lg:items-end lg:justify-end">
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
            {metaLabel ? <span className="text-xs text-text-tertiary">{metaLabel}</span> : null}
            {metaValue ? <p>{metaValue}</p> : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
