"use client";

import { Buildings11, Calendar, ChevronDown, InfoCircle, Phone, User2 } from "@tailgrids/icons";
import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";

import type { ActionPriority, RecommendedAction } from "./types";

interface ActionDetailProps {
  action: RecommendedAction | null;
  onAssign: (action: RecommendedAction) => void;
  onDefer: (action: RecommendedAction) => void;
  onDismiss: (action: RecommendedAction) => void;
}

const priorityLabels: Record<ActionPriority, string> = {
  high: "Ưu tiên cao",
  medium: "Ưu tiên vừa",
  low: "Ưu tiên thấp",
};

const priorityColors: Record<ActionPriority, "error" | "primary" | "gray"> = {
  high: "error",
  medium: "primary",
  low: "gray",
};

export default function ActionDetail({ action, onAssign, onDefer, onDismiss }: ActionDetailProps) {
  const [showMore, setShowMore] = useState(false);

  if (!action) {
    return (
      <aside className="hidden min-h-115 items-center justify-center p-8 xl:flex" aria-label="Chi tiết việc cần xử lý">
        <p className="max-w-60 text-center text-sm leading-6 text-text-secondary">Chọn một việc để xem lý do và giao người phụ trách.</p>
      </aside>
    );
  }

  return (
    <aside className="min-w-0 xl:sticky xl:top-5 xl:max-h-[calc(100vh-2.5rem)] xl:overflow-y-auto" aria-label="Chi tiết việc cần xử lý">
      <div className="border-b border-card-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={action.status === "overdue" ? "error" : action.status === "today" ? "warning" : "primary"}>{action.dueLabel}</Badge>
            <Badge color={priorityColors[action.priority]}>{priorityLabels[action.priority]}</Badge>
          </div>
        </div>
        <h2 className="mt-4 text-balance text-xl leading-7 font-semibold text-text-primary">{action.recommendation} · {action.studentName}</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{action.summary}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5"><Buildings11 size={15} aria-hidden="true" />{action.school}</span>
          <span>Ngành quan tâm: {action.interest}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-background-soft-50 p-3">
            <p className="text-[11px] text-text-tertiary">Tác động dự kiến</p>
            <p className="mt-1 break-words text-sm font-semibold leading-5 text-text-primary">{action.impact}</p>
          </div>
          <div className="rounded-lg bg-background-soft-50 p-3">
            <p className="text-[11px] text-text-tertiary">Độ tin cậy gợi ý</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-primary-500">{action.confidence}%</p>
          </div>
        </div>
      </div>

      <section className="border-b border-card-border p-5" aria-labelledby="evidence-heading">
        <h3 id="evidence-heading" className="text-sm font-semibold text-text-primary">Vì sao cần làm việc này</h3>
        <ul className="mt-3 space-y-2.5">
          {action.evidence.slice(0, 3).map((evidence) => (
            <li key={evidence} className="flex gap-2 text-sm leading-5 text-text-secondary">
              <InfoCircle size={16} className="mt-0.5 shrink-0 text-primary-500" aria-hidden="true" />
              {evidence}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-b border-card-border">
        <button type="button" className="flex w-full items-center justify-between gap-3 p-5 text-left text-sm font-semibold text-text-primary outline-none focus-visible:ring-4 focus-visible:ring-button-primary-focus-ring" onClick={() => setShowMore((value) => !value)} aria-expanded={showMore}>
          <span>Cách xử lý</span>
          <ChevronDown size={18} className={showMore ? "rotate-180 transition-transform" : "transition-transform"} aria-hidden="true" />
        </button>
        {showMore && (
          <div className="space-y-5 px-5 pb-5">
            <div>
              <h3 className="text-xs font-medium text-text-tertiary">Gợi ý trao đổi</h3>
              <ul className="mt-2 space-y-2">
                {action.talkingPoints.map((point) => <li key={point} className="text-sm leading-5 text-text-secondary">{point}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-medium text-text-tertiary">Hoạt động gần đây</h3>
              <ul className="mt-2 space-y-2">
                {action.recentActivity.map((activity) => (
                  <li key={activity.label} className="flex items-start justify-between gap-4 text-sm">
                    <span className="flex items-center gap-2 text-text-secondary"><Phone size={14} aria-hidden="true" />{activity.label}</span>
                    <time className="shrink-0 text-xs text-text-tertiary">{activity.time}</time>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      <div className="p-5">
        <p className="text-xs font-medium text-text-tertiary">Người phụ trách đề xuất</p>
        <p className="mt-1 text-sm font-semibold text-text-primary">{action.suggestedAssignee}</p>
        <Button className="mt-4 w-full" size="md" onPress={() => onAssign(action)}><User2 size={17} />Giao việc</Button>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Button appearance="outline" size="sm" onPress={() => onDefer(action)}><Calendar size={16} />Trì hoãn</Button>
          <Button appearance="ghost" size="sm" onPress={() => onDismiss(action)}>Bỏ đề xuất</Button>
        </div>
      </div>
    </aside>
  );
}
