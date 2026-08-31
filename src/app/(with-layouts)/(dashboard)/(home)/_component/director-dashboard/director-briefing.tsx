"use client";

import { ArrowRight, InfoTriangle } from "@tailgrids/icons";
import Link from "next/link";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { initialDirectorBriefing } from "@/services/api/director-overview/data";
import type { DirectorBriefing as DirectorBriefingType } from "./types";

interface DirectorBriefingProps {
  briefing?: DirectorBriefingType;
}

export default function DirectorBriefing({ briefing = initialDirectorBriefing }: DirectorBriefingProps) {
  const data = briefing ?? initialDirectorBriefing;
  const alert = data.alert;
  const priorityAction = data.priorityAction;

  return (
    <Card className="flex h-full min-w-0 flex-col bg-background-gray-primary">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Việc cần xử lý hôm nay</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Một cảnh báo và việc ưu tiên tương ứng</p>
        </div>
        <span className="rounded-full bg-badge-error-background px-2.5 py-1 text-xs font-medium text-badge-error-text">Cảnh báo</span>
      </CardHeader>

      <Link
        href={alert.href}
        className="group block rounded-xl border border-badge-error-text/30 bg-badge-error-background/60 p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex items-center gap-2 text-xs font-semibold text-error-500">
            <span className="flex size-7 items-center justify-center rounded-lg bg-card-background">
              <InfoTriangle size={15} aria-hidden="true" />
            </span>
            Cảnh báo chính
          </span>
          <span className="text-lg font-semibold text-error-500">{alert.metric}</span>
        </div>
        <p className="mt-3 text-sm font-semibold leading-5 text-text-primary">{alert.title}</p>
        <p className="mt-1 text-xs leading-5 text-text-secondary">{alert.description}</p>
        <p className="mt-3 border-t border-badge-error-text/30 pt-3 text-xs leading-5 text-text-secondary">{alert.evidence}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-500">
          Xem chi tiết
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </Link>

      <div className="mt-5 border-t border-card-border pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-text-primary">Việc nên làm</p>
          <span className="text-xs text-text-tertiary">Ưu tiên 1</span>
        </div>
        <Link
          href={priorityAction.href}
          className="group flex items-start gap-3 rounded-lg bg-card-background px-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-badge-warning-background text-[11px] font-semibold text-badge-warning-text">
            1
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold leading-5 text-text-primary">{priorityAction.title}</span>
            <span className="mt-0.5 block text-xs leading-5 text-text-tertiary">{priorityAction.description}</span>
            <span className="mt-2 block text-xs font-semibold text-success-500">{priorityAction.impact}</span>
          </span>
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
