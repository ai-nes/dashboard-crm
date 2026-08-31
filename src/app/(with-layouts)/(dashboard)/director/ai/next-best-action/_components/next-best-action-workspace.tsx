"use client";

import { Filter } from "@tailgrids/icons";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";

import ActionDetail from "./action-detail";
import ActionQueue from "./action-queue";
import { recommendedActions } from "./data";
import type { RecommendedAction } from "./types";

export default function NextBestActionWorkspace() {
  const [actions, setActions] = useState(recommendedActions);
  const [selectedId, setSelectedId] = useState(recommendedActions[0]?.id ?? null);
  const [filter, setFilter] = useState<"all" | "today">("all");
  const selectedAction = actions.find((action) => action.id === selectedId) ?? null;
  const filteredActions = useMemo(() => filter === "today" ? actions.filter((action) => action.status === "today" || action.status === "overdue") : actions, [actions, filter]);

  const removeAction = (action: RecommendedAction, message: string) => {
    const next = actions.filter((item) => item.id !== action.id);
    setActions(next);
    setSelectedId(next[0]?.id ?? null);
    toast.success(message);
  };

  return <main className="min-w-0 px-2 py-4 pb-8 lg:px-6"><header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><div className="flex items-center gap-2"><h1 className="text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">Điều phối hành động AI</h1><Badge color="primary">{actions.length} cần xử lý</Badge></div><p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">Phân công những thời điểm cần phản hồi nhất, với đủ căn cứ để ra quyết định nhanh.</p></div></header><div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Bộ lọc hàng đợi"><Button size="sm" appearance={filter === "all" ? "fill" : "outline"} onPress={() => setFilter("all")}>Tất cả</Button><Button size="sm" appearance={filter === "today" ? "fill" : "outline"} onPress={() => setFilter("today")}>Cần xử lý ngay</Button><span className="ml-auto inline-flex items-center gap-1.5 text-xs text-text-tertiary"><Filter size={15} aria-hidden="true" />Sắp theo hạn xử lý</span></div><Card className="grid min-h-[640px] min-w-0 overflow-hidden p-0 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]"><section className="min-w-0 border-b border-card-border xl:border-r xl:border-b-0" aria-label="Hàng đợi hành động AI"><div className="flex items-center justify-between gap-3 border-b border-card-border px-5 py-4"><div><h2 className="text-sm font-semibold text-text-primary">Hàng đợi đề xuất</h2><p className="mt-1 text-xs text-text-tertiary">Chọn một mục để xem căn cứ trước khi phân công.</p></div><span className="text-xs text-text-tertiary">{filteredActions.length} mục</span></div><ActionQueue actions={filteredActions} selectedId={selectedId} onSelect={setSelectedId} /></section><ActionDetail action={selectedAction} onAssign={(action) => removeAction(action, `Đã phân công ${action.studentName} cho ${action.suggestedAssignee}.`)} onDefer={(action) => removeAction(action, `Đã trì hoãn đề xuất cho ${action.studentName}.`)} onDismiss={(action) => removeAction(action, `Đã ghi nhận đề xuất cho ${action.studentName} không phù hợp.`)} /></Card></main>;
}
