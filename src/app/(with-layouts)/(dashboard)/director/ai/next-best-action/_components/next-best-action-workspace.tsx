"use client";

import { Filter } from "@tailgrids/icons";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";

import ActionConfirmationDialog, { type ActionConfirmationType } from "./action-confirmation-dialog";
import ActionControlPolicy from "./action-control-policy";
import ActionDetail from "./action-detail";
import ActionOutcomeChart from "./action-outcome-chart";
import ActionQueue from "./action-queue";
import { recommendedActions } from "./data";
import NextBestActionHeader from "./next-best-action-header";
import SlaRiskCases from "../../../sla/_components/sla-risk-cases";
import SlaRiskReasons from "../../../sla/_components/sla-risk-reasons";
import SlaStatusOverview from "../../../sla/_components/sla-status-overview";
import type { RecommendedAction } from "./types";

export default function NextBestActionWorkspace() {
  const [actions, setActions] = useState(recommendedActions);
  const [selectedId, setSelectedId] = useState(recommendedActions[0]?.id ?? null);
  const [filter, setFilter] = useState<"all" | "today">("all");
  const [pendingAction, setPendingAction] = useState<{ action: RecommendedAction; type: ActionConfirmationType } | null>(null);
  const urgentCount = actions.filter((action) => action.status === "today" || action.status === "overdue").length;
  const filteredActions = useMemo(
    () => filter === "today" ? actions.filter((action) => action.status === "today" || action.status === "overdue") : actions,
    [actions, filter],
  );
  const selectedAction = filteredActions.find((action) => action.id === selectedId) ?? filteredActions[0] ?? null;

  const removeAction = (action: RecommendedAction, message: string) => {
    const next = actions.filter((item) => item.id !== action.id);
    setActions(next);
    setSelectedId(next[0]?.id ?? null);
    toast.success(message);
  };

  return (
    <main className="min-w-0 space-y-4 px-2 py-4 pb-8 lg:px-6" id="main-content">
      <NextBestActionHeader />
      <SlaStatusOverview />

      <section className="min-w-0" aria-label="Danh sách việc cần xử lý">
        <div className="mb-3 flex flex-wrap items-center gap-2" aria-label="Bộ lọc việc cần xử lý">
          <Button size="sm" appearance={filter === "all" ? "fill" : "outline"} aria-pressed={filter === "all"} onPress={() => setFilter("all")}>
            Tất cả ({actions.length})
          </Button>
          <Button size="sm" appearance={filter === "today" ? "fill" : "outline"} aria-pressed={filter === "today"} onPress={() => setFilter("today")}>
            Hôm nay & quá hạn ({urgentCount})
          </Button>
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-text-tertiary">
            <Filter size={15} aria-hidden="true" />
            Ưu tiên theo hạn xử lý
          </span>
        </div>

        <Card className="grid min-h-[560px] min-w-0 overflow-hidden p-0 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <section className="min-w-0 border-b border-card-border xl:border-r xl:border-b-0" aria-labelledby="action-queue-heading">
            <div className="flex items-center justify-between gap-3 border-b border-card-border px-5 py-4">
              <div>
                <h2 id="action-queue-heading" className="text-sm font-semibold text-text-primary">Danh sách việc cần xử lý</h2>
                <p className="mt-1 text-xs text-text-tertiary">Chọn một việc để xem lý do và người phụ trách.</p>
              </div>
              <span className="text-xs text-text-tertiary">{filteredActions.length} việc</span>
            </div>
            <ActionQueue actions={filteredActions} selectedId={selectedAction?.id ?? null} onSelect={setSelectedId} />
          </section>
          <ActionDetail
            action={selectedAction}
            onAssign={(action) => setPendingAction({ action, type: "assign" })}
            onDefer={(action) => setPendingAction({ action, type: "defer" })}
            onDismiss={(action) => setPendingAction({ action, type: "dismiss" })}
          />
        </Card>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]" aria-label="Rủi ro cần xử lý">
        <SlaRiskCases />
        <SlaRiskReasons />
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]" aria-label="Kết quả và quy tắc thực hiện">
        <ActionOutcomeChart />
        <ActionControlPolicy />
      </section>

      <ActionConfirmationDialog
        action={pendingAction?.action ?? null}
        type={pendingAction?.type ?? null}
        onClose={() => setPendingAction(null)}
        onConfirm={() => {
          if (!pendingAction) return;
          const message = pendingAction.type === "assign"
            ? `Đã phân công ${pendingAction.action.studentName} cho ${pendingAction.action.suggestedAssignee}.`
            : pendingAction.type === "defer"
              ? `Đã ghi nhận trì hoãn việc của ${pendingAction.action.studentName}.`
              : `Đã bỏ đề xuất cho ${pendingAction.action.studentName}.`;
          removeAction(pendingAction.action, message);
          setPendingAction(null);
        }}
      />
    </main>
  );
}
