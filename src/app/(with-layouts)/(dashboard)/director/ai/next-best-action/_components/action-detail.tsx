"use client";

import { Calendar, CheckCircle1, ChevronDown, Phone, User2 } from "@tailgrids/icons";
import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";

import type { RecommendedAction } from "./types";

interface ActionDetailProps {
  action: RecommendedAction | null;
  onAssign: (action: RecommendedAction) => void;
  onDefer: (action: RecommendedAction) => void;
  onDismiss: (action: RecommendedAction) => void;
}

export default function ActionDetail({ action, onAssign, onDefer, onDismiss }: ActionDetailProps) {
  const [showMore, setShowMore] = useState(false);

  if (!action) return <aside className="hidden xl:flex xl:min-h-115 xl:items-center xl:justify-center xl:p-8"><p className="max-w-60 text-center text-sm leading-6 text-text-secondary">Chọn một đề xuất để xem căn cứ và phân công xử lý.</p></aside>;

  return <aside className="min-w-0 xl:sticky xl:top-5 xl:max-h-[calc(100vh-2.5rem)] xl:overflow-y-auto"><div className="border-b border-card-border p-5"><div className="flex items-start justify-between gap-3"><Badge color={action.status === "overdue" ? "error" : action.status === "today" ? "warning" : "primary"}>{action.dueLabel}</Badge><span className="text-xs text-text-tertiary">Đề xuất bởi AI</span></div><h2 className="mt-4 text-balance text-xl leading-7 font-semibold text-text-primary">{action.recommendation} cho {action.studentName}</h2><p className="mt-2 text-sm leading-6 text-text-secondary">{action.summary}</p><div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-secondary"><span className="inline-flex items-center gap-1.5"><User2 size={15} aria-hidden="true" />{action.school}</span><span>{action.interest}</span></div></div><section className="border-b border-card-border p-5" aria-labelledby="evidence-heading"><h3 id="evidence-heading" className="text-sm font-semibold text-text-primary">Căn cứ AI đề xuất</h3><ul className="mt-3 space-y-2.5">{action.evidence.slice(0, 3).map((evidence) => <li key={evidence} className="flex gap-2 text-sm leading-5 text-text-secondary"><CheckCircle1 size={16} className="mt-0.5 shrink-0 text-success-500" aria-hidden="true" />{evidence}</li>)}</ul></section><section className="border-b border-card-border"><button type="button" className="flex w-full items-center justify-between gap-3 p-5 text-left text-sm font-semibold text-text-primary outline-none focus-visible:ring-4 focus-visible:ring-button-primary-focus-ring" onClick={() => setShowMore((value) => !value)} aria-expanded={showMore}><span>Chi tiết hỗ trợ</span><ChevronDown size={18} className={showMore ? "rotate-180 transition-transform" : "transition-transform"} aria-hidden="true" /></button>{showMore && <div className="space-y-5 px-5 pb-5"><div><h3 className="text-xs font-medium text-text-tertiary">Kịch bản gợi ý</h3><ul className="mt-2 space-y-2">{action.talkingPoints.map((point) => <li key={point} className="text-sm leading-5 text-text-secondary">{point}</li>)}</ul></div><div><h3 className="text-xs font-medium text-text-tertiary">Liên hệ gần nhất</h3><ul className="mt-2 space-y-2">{action.recentActivity.map((activity) => <li key={activity.label} className="flex items-start justify-between gap-4 text-sm"><span className="flex items-center gap-2 text-text-secondary"><Phone size={14} aria-hidden="true" />{activity.label}</span><time className="shrink-0 text-xs text-text-tertiary">{activity.time}</time></li>)}</ul></div></div>}</section><div className="p-5"><p className="text-xs font-medium text-text-tertiary">Người phù hợp để xử lý</p><p className="mt-1 text-sm font-semibold text-text-primary">{action.suggestedAssignee}</p><Button className="mt-4 w-full" size="md" onPress={() => onAssign(action)}><User2 size={17} />Phân công xử lý</Button><div className="mt-3 grid grid-cols-2 gap-3"><Button appearance="outline" size="sm" onPress={() => onDefer(action)}><Calendar size={16} />Trì hoãn</Button><Button appearance="ghost" size="sm" onPress={() => onDismiss(action)}>Không phù hợp</Button></div></div></aside>;
}
