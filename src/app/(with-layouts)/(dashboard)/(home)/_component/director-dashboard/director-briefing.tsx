"use client";

import { ArrowRight, ArrowUpward, CheckCircle1, InfoTriangle } from "@tailgrids/icons";
import Link from "next/link";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { aiInsights, executiveActions } from "./data";

const insight = aiInsights[0];

export default function DirectorBriefing() {
  return (
    <Card className="flex h-full min-w-0 flex-col bg-background-gray-primary">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Bản tin điều hành</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Điều Director cần biết và quyết định hôm nay</p>
        </div>
        <span className="rounded-full bg-card-background px-2.5 py-1 text-xs font-medium text-text-secondary">Hôm nay</span>
      </CardHeader>

      <Link
        href={insight.href}
        className="group block rounded-xl border border-badge-error-text/30 bg-badge-error-background/60 p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex items-center gap-2 text-xs font-semibold text-error-500">
            <span className="flex size-7 items-center justify-center rounded-lg bg-card-background">
              <InfoTriangle size={15} aria-hidden="true" />
            </span>
            Rủi ro ưu tiên
          </span>
          <span className="text-lg font-semibold text-error-500">{insight.metric}</span>
        </div>
        <p className="mt-3 text-sm font-semibold leading-5 text-text-primary">{insight.title}</p>
        <p className="mt-1 text-xs leading-5 text-text-secondary">{insight.description}</p>
        <p className="mt-3 border-t border-badge-error-text/30 pt-3 text-xs leading-5 text-text-secondary">{insight.evidence}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-500">
          Xem nguyên nhân
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </Link>

      <div className="mt-5 border-t border-card-border pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-text-primary">Hành động tiếp theo</p>
          <span className="text-xs text-text-tertiary">3 đề xuất</span>
        </div>
        <div className="space-y-2">
          {executiveActions.slice(0, 2).map((action, index) => (
            <Link
              key={action.id}
              href={action.href}
              className="group flex items-start gap-3 rounded-lg px-1 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-card-background text-[11px] font-semibold text-text-secondary">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold leading-5 text-text-primary">{action.title}</span>
                <span className="mt-0.5 block text-xs leading-5 text-text-tertiary">{action.impact}</span>
              </span>
              <ArrowRight size={14} className="mt-1 shrink-0 text-icon-tertiary transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          ))}
        </div>
        <Link href="/director/ai/next-best-action" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600">
          Xem toàn bộ hành động
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-lg bg-badge-success-background px-3 py-2.5 text-xs text-badge-success-text">
        <CheckCircle1 size={15} className="shrink-0" aria-hidden="true" />
        <span>Hệ thống đã cập nhật 3 tín hiệu mới trong 2 phút qua.</span>
        <ArrowUpward size={13} className="ml-auto shrink-0" aria-hidden="true" />
      </div>
    </Card>
  );
}
