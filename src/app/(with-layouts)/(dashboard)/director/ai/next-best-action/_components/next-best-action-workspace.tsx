"use client";

import { Filter } from "@tailgrids/icons";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { useDirectorNextBestActionQuery } from "@/hooks/use-director-next-best-action-queries";
import {
  applyActionCommand,
  type DirectorNextBestActionData,
} from "@/services/api/director-next-best-action";

import ActionConfirmationDialog, {
  type ActionConfirmationType,
} from "./action-confirmation-dialog";
import ActionCardHost from "./action-card-host";
import ActionControlPolicy, {
  type ActionControlPolicyRow,
} from "./action-control-policy";
import ActionOutcomeChart from "./action-outcome-chart";
import ActionQueue from "./action-queue";
import NextBestActionHeader from "./next-best-action-header";
import SlaRiskCases from "../../../sla/_components/sla-risk-cases";
import SlaRiskReasons from "../../../sla/_components/sla-risk-reasons";
import SlaStatusOverview from "../../../sla/_components/sla-status-overview";
import type {
  SlaRiskCase,
  SlaRiskReason,
  SlaStatusBucket,
} from "../../../sla/_components/types";
import type { RecommendedAction } from "./types";

const PAGE_SIZE = 8;

function formatNumber(value: number, maximumFractionDigits = 0): string {
  return value.toLocaleString("vi-VN", { maximumFractionDigits });
}

function adaptSnapshot(data: DirectorNextBestActionData | undefined) {
  if (!data) {
    return {
      actions: [] as RecommendedAction[],
      statusBuckets: [] as SlaStatusBucket[],
      riskCases: [] as SlaRiskCase[],
      riskReasons: [] as SlaRiskReason[],
      outcomes: [],
      policyRows: [] as ActionControlPolicyRow[],
    };
  }

  return {
    actions: data.queue.actions.map((action) => ({
      ...action,
      interest: action.interest ?? "Chưa xác định",
      suggestedAssignee: action.suggestedAssignee ?? "Chưa phân công",
      recentActivity: action.recentActivity.map((activity) => ({
        id: activity.id,
        label: activity.label,
        time: activity.time ?? "Chưa xác định",
      })),
    })),
    statusBuckets: data.sla.statusBuckets.map((bucket) => ({
      label: bucket.label,
      value: formatNumber(bucket.count),
      share: `${formatNumber(bucket.share, 1)}%`,
      shareValue: bucket.share,
      detail: bucket.detail,
      tone: bucket.tone,
    })),
    riskCases: data.sla.riskCases.map((riskCase) => ({
      studentId: riskCase.studentId,
      name: riskCase.name,
      school: riskCase.school,
      probability: riskCase.probability,
      silentFor: riskCase.silentFor,
      owner: riskCase.owner,
      priority: (riskCase.priority === "high"
        ? "Cao"
        : "Theo dõi") as SlaRiskCase["priority"],
      href: riskCase.href,
    })),
    riskReasons: data.sla.riskReasons.map((reason) => ({
      label: reason.label,
      percentage: reason.percentage,
      detail: reason.detail,
    })),
    outcomes: data.outcomes.rows.map((row) => ({
      label: row.label,
      submitted: row.submitted,
      accepted: row.accepted,
      executed: row.executed,
      progressed: row.progressed,
      transitionRate: row.transitionRate,
    })),
    policyRows: data.controlPolicy.rows.map((row) => ({
      label: row.label,
      color: (row.level === "automatic"
        ? "success"
        : row.level === "approval"
          ? "error"
          : "primary") as ActionControlPolicyRow["color"],
      detail: row.detail,
      action:
        row.execution === "system"
          ? "Hệ thống thực hiện"
          : row.execution === "business-rule"
            ? "Kiểm tra trước khi gửi"
            : "Người phụ trách xác nhận",
    })),
  };
}

export default function NextBestActionWorkspace() {
  const [filter, setFilter] = useState<"all" | "today">("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    action: RecommendedAction;
    type: ActionConfirmationType;
  } | null>(null);
  const [commandBusy, setCommandBusy] = useState(false);
  const queryParams = useMemo(
    () => ({
      queueFilter: filter === "today" ? ("urgent" as const) : ("all" as const),
      page,
      pageSize: PAGE_SIZE,
      outcomePeriod: "30d",
    }),
    [filter, page],
  );
  const { data, error, refetch } = useDirectorNextBestActionQuery(queryParams);
  const snapshot = useMemo(() => adaptSnapshot(data), [data]);
  const selectedAction =
    snapshot.actions.find((action) => action.id === selectedId) ??
    snapshot.actions[0] ??
    null;
  const totalActions = data?.queue.pagination.total ?? 0;
  const allCount = data?.queue.counts.all ?? 0;
  const urgentCount = data?.queue.counts.urgent ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalActions / PAGE_SIZE));

  function changeFilter(next: "all" | "today") {
    setFilter(next);
    setPage(1);
    setSelectedId(null);
  }

  function goToPage(next: number) {
    setPage(Math.min(Math.max(1, next), pageCount));
    setSelectedId(null);
  }

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  const refresh = async () => {
    const result = await refetch();
    if (!result.error) toast.success("Đã làm mới danh sách việc cần xử lý.");
  };

  const confirmAction = async () => {
    if (!pendingAction || commandBusy) return;

    const { action, type } = pendingAction;
    if (type === "assign" && !action.suggestedAssigneeId) {
      toast.error("Chưa có người phụ trách hợp lệ để giao việc.");
      return;
    }
    setCommandBusy(true);
    try {
      await applyActionCommand({
        actionId: action.id,
        command: type,
        ...(type === "assign" && action.suggestedAssigneeId
          ? { assigneeId: action.suggestedAssigneeId }
          : {}),
        ...(type === "dismiss"
          ? { reason: "Bỏ đề xuất từ workspace Director" }
          : {}),
        expectedVersion: action.version ?? 0,
        idempotencyKey: `director-nba:${action.id}:${action.version ?? 0}:${type}:${crypto.randomUUID()}`,
      });
      const message =
        type === "assign"
          ? `Đã phân công ${action.studentName} cho ${action.suggestedAssignee}.`
          : type === "defer"
            ? `Đã ghi nhận trì hoãn việc của ${action.studentName}.`
            : `Đã bỏ đề xuất cho ${action.studentName}.`;
      toast.success(message);
      setPendingAction(null);
      // A command can empty the last page (its only row moved out of the
      // queue). Step back so the queue never lands on a blank page.
      const refreshed = await refetch();
      const freshTotal = refreshed.data?.queue.pagination.total ?? 0;
      const lastPage = Math.max(1, Math.ceil(freshTotal / PAGE_SIZE));
      if (page > lastPage) goToPage(lastPage);
    } catch (commandError) {
      toast.error(
        commandError instanceof Error
          ? commandError.message
          : "Không thể cập nhật việc cần xử lý.",
      );
    } finally {
      setCommandBusy(false);
    }
  };

  return (
    <main
      className="min-w-0 space-y-4 px-2 py-4 pb-8 lg:px-6"
      id="main-content"
    >
      <NextBestActionHeader
        meta={data?.meta}
        responseWindowHours={data?.sla.responseWindowHours}
        onRefresh={refresh}
      />
      <SlaStatusOverview buckets={snapshot.statusBuckets} />

      <section className="min-w-0" aria-label="Danh sách việc cần xử lý">
        <div
          className="mb-3 flex flex-wrap items-center gap-2"
          aria-label="Bộ lọc việc cần xử lý"
        >
          <Button
            size="sm"
            appearance={filter === "all" ? "fill" : "outline"}
            aria-pressed={filter === "all"}
            onPress={() => changeFilter("all")}
          >
            Tất cả ({allCount})
          </Button>
          <Button
            size="sm"
            appearance={filter === "today" ? "fill" : "outline"}
            aria-pressed={filter === "today"}
            onPress={() => changeFilter("today")}
          >
            Hôm nay & quá hạn ({urgentCount})
          </Button>
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-text-tertiary">
            <Filter size={15} aria-hidden="true" />
            Ưu tiên theo hạn xử lý
          </span>
        </div>

        <Card className="grid min-h-[560px] min-w-0 overflow-hidden p-0 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <section
            className="min-w-0 border-b border-card-border xl:border-r xl:border-b-0"
            aria-labelledby="action-queue-heading"
          >
            <div className="flex items-center justify-between gap-3 border-b border-card-border px-5 py-4">
              <div>
                <h2
                  id="action-queue-heading"
                  className="text-sm font-semibold text-text-primary"
                >
                  Danh sách việc cần xử lý
                </h2>
                <p className="mt-1 text-xs text-text-tertiary">
                  Chọn một việc để xem lý do và người phụ trách.
                </p>
              </div>
              <span className="text-xs text-text-tertiary">
                {totalActions} việc
              </span>
            </div>
            <ActionQueue
              actions={snapshot.actions}
              selectedId={selectedAction?.id ?? null}
              onSelect={setSelectedId}
            />
            {pageCount > 1 && (
              <div className="flex items-center justify-between gap-3 border-t border-card-border px-5 py-3">
                <span className="text-xs text-text-tertiary">
                  Trang {page}/{pageCount}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    appearance="outline"
                    size="sm"
                    isDisabled={page <= 1}
                    onPress={() => goToPage(page - 1)}
                  >
                    Trước
                  </Button>
                  <Button
                    appearance="outline"
                    size="sm"
                    isDisabled={!data?.queue.pagination.hasNext}
                    onPress={() => goToPage(page + 1)}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </section>
          <ActionCardHost
            action={selectedAction}
            onAssign={(action) => setPendingAction({ action, type: "assign" })}
            onDefer={(action) => setPendingAction({ action, type: "defer" })}
            onDismiss={(action) =>
              setPendingAction({ action, type: "dismiss" })
            }
          />
        </Card>
      </section>

      <section
        className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]"
        aria-label="Rủi ro cần xử lý"
      >
        <SlaRiskCases riskCases={snapshot.riskCases} />
        <SlaRiskReasons riskReasons={snapshot.riskReasons} />
      </section>

      <section
        className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]"
        aria-label="Kết quả và quy tắc thực hiện"
      >
        <ActionOutcomeChart outcomes={snapshot.outcomes} />
        <ActionControlPolicy policyRows={snapshot.policyRows} />
      </section>

      <ActionConfirmationDialog
        action={pendingAction?.action ?? null}
        type={pendingAction?.type ?? null}
        onClose={() => setPendingAction(null)}
        onConfirm={confirmAction}
      />
    </main>
  );
}
