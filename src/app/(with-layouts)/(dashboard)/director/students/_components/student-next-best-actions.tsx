"use client";

import { ErrorCircle1, InfoTriangle } from "@tailgrids/icons";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import {
  useDecideNbaRecommendation,
  useRunStudentNbaEvaluation,
  useStudentNbaWorklistQuery,
} from "@/hooks/use-student-nba-queries";
import {
  NbaApiError,
  type NbaDecisionOperation,
  type NbaDecisionRequest,
  type NbaRecommendation,
} from "@/services/api/nba";
import type { Student360Data } from "@/services/api/students/types";

import StudentNbaRecommendationCard from "./student-nba-recommendation-card";
import StudentNbaDecisionDialog from "./student-nba-decision-dialog";
import {
  NBA_OPERATION_LABELS,
  type DecisionFields,
  toIsoDateTime,
} from "./student-nba-ui";

interface StudentNextBestActionsProps {
  data: Student360Data;
  studentId: string;
  onActionsCountChange?: (count: number) => void;
}

type NbaExpansionMode = "collapse" | "expand";

export default function StudentNextBestActions({
  data,
  studentId,
  onActionsCountChange,
}: StudentNextBestActionsProps) {
  const router = useRouter();
  const [expandedRecommendationIds, setExpandedRecommendationIds] = useState<
    Set<string> | null
  >(null);
  const [decision, setDecision] = useState<{
    recommendation: NbaRecommendation;
    operation: NbaDecisionOperation;
  } | null>(null);
  const [postRecommendations, setPostRecommendations] = useState<
    NbaRecommendation[] | null
  >(null);
  const [idempotencyKeys, setIdempotencyKeys] = useState<
    Record<string, string>
  >({});
  const query = useStudentNbaWorklistQuery(studentId, {
    enabled: Boolean(studentId.trim()),
  });
  const decisionMutation = useDecideNbaRecommendation();
  const runMutation = useRunStudentNbaEvaluation();

  const worklistActions = useMemo(
    () =>
      (query.data?.items ?? []).filter(
        (item) => item.studentId === studentId.trim(),
      ),
    [query.data?.items, studentId],
  );
  const actions = useMemo(() => {
    if (postRecommendations === null) return worklistActions;

    return postRecommendations
      .filter((recommendation) => recommendation.studentId === studentId.trim())
      .map((recommendation) => {
        const worklistItem = worklistActions.find((item) =>
          sameNbaRecommendation(item, recommendation),
        );

        if (!worklistItem) return recommendation;

        // The worklist owns the persisted recommendation content and decision
        // metadata. Keep the POST explanation only while GET is incomplete.
        return {
          ...recommendation,
          ...worklistItem,
          explanation: worklistItem.explanation ?? recommendation.explanation,
          explanationSource:
            worklistItem.explanationSource ?? recommendation.explanationSource,
          expectedRevision: worklistItem.expectedRevision,
          revision: worklistItem.revision,
          permittedDecisions: worklistItem.permittedDecisions,
        };
      });
  }, [postRecommendations, studentId, worklistActions]);
  useEffect(() => {
    onActionsCountChange?.(actions.length);
  }, [actions.length, onActionsCountChange]);
  const areAllRecommendationsExpanded =
    actions.length > 0 &&
    (expandedRecommendationIds === null ||
      actions.every((recommendation) =>
        expandedRecommendationIds.has(recommendation.id),
      ));
  const handleExpansionModeChange = (mode: NbaExpansionMode) => {
    setExpandedRecommendationIds(
      mode === "expand"
        ? new Set(actions.map((recommendation) => recommendation.id))
        : new Set(),
    );
  };
  const handleRecommendationExpandedChange = (
    id: string,
    expanded: boolean,
  ) => {
    setExpandedRecommendationIds((current) => {
      const next = new Set(
        current ?? actions.map((recommendation) => recommendation.id),
      );
      if (expanded) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };
  const beginDecision = (
    recommendation: NbaRecommendation,
    operation: NbaDecisionOperation,
  ) => {
    if (decisionMutation.isPending) return;
    setDecision({ recommendation, operation });
  };

  const cancelDecision = () => {
    if (!decisionMutation.isPending) setDecision(null);
  };

  const runNba = async () => {
    try {
      const result = await runMutation.mutateAsync({ studentId });
      await query.refetch();
      const recommendations = result.recommendations.filter(
        (recommendation) => recommendation.studentId === studentId.trim(),
      );
      setPostRecommendations(recommendations);

      if (recommendations.length > 0 || result.recommendationCount > 0) {
        toast.success("Đã tạo đề xuất NBA cho học sinh.");
      } else {
        toast.success("Đánh giá NBA hoàn tất nhưng chưa có hành động phù hợp.");
      }
    } catch (error) {
      toast.error(nbaRunErrorMessage(error));
    }
  };

  const submitDecision = async (
    recommendation: NbaRecommendation,
    operation: NbaDecisionOperation,
    fields: DecisionFields,
  ) => {
    if (!recommendation.expectedRevision) {
      toast.error(
        "Đề xuất này chưa có phiên bản hợp lệ để ghi nhận quyết định.",
      );
      return;
    }

    const intentKey = `${recommendation.id}:${operation}`;
    const idempotencyKey =
      idempotencyKeys[intentKey] ??
      `decide:${recommendation.id}:${operation}:${crypto.randomUUID()}`;
    if (!idempotencyKeys[intentKey]) {
      setIdempotencyKeys((current) => ({
        ...current,
        [intentKey]: idempotencyKey,
      }));
    }

    const request: NbaDecisionRequest = {
      name: recommendation.id,
      expectedRevision: recommendation.expectedRevision,
      operation,
      idempotencyKey,
      ...(fields.reason ? { decisionReason: fields.reason } : {}),
      ...(fields.revisitAt
        ? { revisitAt: toIsoDateTime(fields.revisitAt) }
        : {}),
      ...(operation === "ACCEPT_WITH_CHANGES"
        ? {
            delta: {
              ...(fields.priority ? { priority: fields.priority } : {}),
              ...(fields.channel ? { channel: fields.channel } : {}),
              ...(fields.dueAt ? { due_at: toIsoDateTime(fields.dueAt) } : {}),
            },
          }
        : {}),
    };

    try {
      const result = await decisionMutation.mutateAsync(request);
      setDecision(null);
      setPostRecommendations(null);
      await query.refetch();

      if (result.action) {
        toast.success("Đã chấp nhận đề xuất và tạo Task.");
        router.push(
          `/director/students/${encodeURIComponent(studentId)}?tab=activities&taskId=${encodeURIComponent(result.action)}`,
        );
      } else {
        toast.success(decisionSuccessMessage(operation));
      }
    } catch (error) {
      toast.error(decisionErrorMessage(error));
    }
  };

  return (
    <>
      <section
        aria-labelledby="next-best-actions-heading"
        className="min-w-0"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {actions.length > 0 && (
              <NbaExpansionSelect
                value={areAllRecommendationsExpanded ? "expand" : "collapse"}
                onChange={handleExpansionModeChange}
              />
            )}
            <Button
              variant="primary"
              appearance="outline"
              size="sm"
              onPress={() => void runNba()}
              isDisabled={
                query.isFetching ||
                runMutation.isPending ||
                decisionMutation.isPending
              }
            >
              {runMutation.isPending ? "Đang tạo gợi ý…" : "Gợi ý hành động"}
            </Button>
          </div>
        </div>

        {query.isLoading && <NbaPanelSkeleton />}

        {!query.isLoading && query.isError && (
          <div
            className="mt-5 flex items-start gap-2.5 rounded-lg border border-card-border bg-badge-error-background p-3"
            role="alert"
          >
            <ErrorCircle1
              size={16}
              className="mt-0.5 shrink-0 text-error-600"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Chưa thể đồng bộ đề xuất NBA
              </p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                {nbaErrorMessage(query.error)}
              </p>
              <Button
                appearance="outline"
                size="xs"
                className="mt-3"
                onPress={() => void query.refetch()}
              >
                Thử lại
              </Button>
            </div>
          </div>
        )}

        {!query.isLoading && !query.isError && actions.length === 0 && (
          <div
            className="mt-8 flex flex-col items-center px-4 py-8 text-center"
            role="status"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-background-gray-secondary text-text-tertiary">
              <InfoTriangle size={18} aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-semibold text-text-primary">
              Chưa có hành động phù hợp lúc này
            </p>
            <p className="mt-1 max-w-md text-xs leading-5 text-text-secondary">
              Hệ thống sẽ cập nhật khi có tín hiệu mới. Bạn cũng có thể chọn
              “Gợi ý hành động” để chạy đánh giá NBA ngay.
            </p>
          </div>
        )}

        {!query.isLoading && !query.isError && actions.length > 0 && (
          <div className="mt-5 space-y-3" aria-label="Danh sách đề xuất NBA">
            {actions.map((action) => (
              <StudentNbaRecommendationCard
                key={action.id}
                recommendation={action}
                expanded={
                  expandedRecommendationIds === null ||
                  expandedRecommendationIds.has(action.id)
                }
                onExpandedChange={(expanded) =>
                  handleRecommendationExpandedChange(action.id, expanded)
                }
                onBeginDecision={beginDecision}
              />
            ))}
          </div>
        )}
      </section>

      {decision && (
        <StudentNbaDecisionDialog
          key={`${decision.recommendation.id}-${decision.operation}`}
          recommendation={decision.recommendation}
          operation={decision.operation}
          isSubmitting={decisionMutation.isPending}
          onClose={cancelDecision}
          onSubmit={(fields) =>
            submitDecision(decision.recommendation, decision.operation, fields)
          }
        />
      )}

    </>
  );
}

function NbaExpansionSelect({
  value,
  onChange,
}: {
  value: NbaExpansionMode;
  onChange: (value: NbaExpansionMode) => void;
}) {
  return (
    <Select
      value={value}
      onChange={(key) => onChange(String(key) as NbaExpansionMode)}
      aria-label="Hiển thị đề xuất NBA"
      className="w-fit"
    >
      <SelectTrigger
        appearance="ghost"
        className="h-auto min-h-8 justify-start gap-1.5 whitespace-nowrap rounded-lg border-0 bg-transparent px-2 text-sm font-semibold text-text-primary shadow-none hover:bg-background-gray-secondary hover:text-text-primary"
      >
        <SelectValue className="max-w-none text-sm font-semibold text-text-primary" />
        <SelectIndicator className="text-text-primary" />
      </SelectTrigger>
      <SelectContent className="min-w-44">
        <SelectItem id="collapse" textValue="Thu gọn tất cả" className="py-2 whitespace-nowrap">
          Thu gọn tất cả
        </SelectItem>
        <SelectItem id="expand" textValue="Mở rộng tất cả" className="py-2 whitespace-nowrap">
          Mở rộng tất cả
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

function sameNbaRecommendation(
  left: NbaRecommendation,
  right: NbaRecommendation,
): boolean {
  return (
    left.id === right.id ||
    (Boolean(left.recommendationKey) &&
      left.recommendationKey === right.recommendationKey)
  );
}

function decisionSuccessMessage(operation: NbaDecisionOperation): string {
  return `${NBA_OPERATION_LABELS[operation]} đề xuất thành công.`;
}

function nbaErrorMessage(error: Error | null): string {
  if (error instanceof NbaApiError && error.status === 403) {
    return "Bạn không có quyền xem đề xuất của học sinh này.";
  }
  if (error instanceof NbaApiError && error.status === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để xem đề xuất.";
  }
  if (error instanceof NbaApiError && error.status === 502) {
    return "Dữ liệu đề xuất chưa đúng định dạng. Vui lòng thử lại hoặc báo quản trị viên.";
  }
  if (error instanceof NbaApiError && error.status === 503) {
    return "Không thể kết nối tới hệ thống NBA. Vui lòng thử lại sau ít phút.";
  }
  if (error instanceof NbaApiError && error.status >= 500) {
    return "Hệ thống NBA đang được đồng bộ. Vui lòng thử lại sau ít phút.";
  }
  return "Không thể tải đề xuất lúc này. Vui lòng thử lại sau.";
}

function nbaRunErrorMessage(error: unknown): string {
  if (!(error instanceof NbaApiError)) {
    return "Không thể chạy đánh giá NBA. Vui lòng thử lại sau.";
  }
  if (error.status === 403) {
    return "Bạn không có quyền chạy NBA cho học sinh này.";
  }
  if (error.status === 409) {
    return "Một lần đánh giá NBA đang chạy hoặc yêu cầu chưa được chấp nhận.";
  }
  if (error.status === 422) {
    return "Yêu cầu chạy NBA chưa hợp lệ. Vui lòng thử lại.";
  }
  if (error.status === 503 || error.status >= 500) {
    return "Hệ thống NBA đang bận. Vui lòng thử lại sau ít phút.";
  }
  return "Không thể chạy đánh giá NBA. Vui lòng thử lại sau.";
}

function decisionErrorMessage(error: unknown): string {
  if (!(error instanceof NbaApiError)) {
    return "Không thể ghi nhận quyết định NBA. Vui lòng thử lại.";
  }
  if (error.code === "STALE_REVISION") {
    return "Đề xuất đã thay đổi. Danh sách đã được tải lại, hãy xem và quyết định lại.";
  }
  if (error.code === "INVALID_STATE") {
    return "Đề xuất này đã được quyết định trước đó. Danh sách đã được tải lại.";
  }
  if (error.code === "ACTION_EXPIRED") {
    return "Đề xuất đã hết hạn và cần được tạo lại từ một lần đánh giá NBA mới.";
  }
  if (error.code === "FORBIDDEN") {
    return "Tài khoản hiện tại không được phép quyết định đề xuất này.";
  }
  if (error.status === 403 && error.code === "OUT_OF_SCOPE") {
    return "Học sinh này đang thuộc owner hoặc team khác. Hãy đăng nhập tài khoản phụ trách hoặc nhờ Trưởng nhóm phân công lại.";
  }
  if (error.status === 403) {
    return "Tài khoản hiện tại không có quyền quyết định đề xuất này.";
  }
  return error.message || "Không thể ghi nhận quyết định NBA.";
}

function NbaPanelSkeleton() {
  return (
    <div className="mt-5 space-y-3" role="status" aria-live="polite">
      {["w-36", "w-11/12"].map((width, index) => (
        <div
          key={`nba-skeleton-${index}`}
          className="rounded-xl border border-card-border p-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className={`h-4 ${width}`} />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
