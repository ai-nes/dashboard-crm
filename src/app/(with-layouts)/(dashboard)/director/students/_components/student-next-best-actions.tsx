"use client";

import { ErrorCircle1, InfoTriangle } from "@tailgrids/icons";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
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
}

export default function StudentNextBestActions({
  data,
  studentId,
}: StudentNextBestActionsProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
  const selectedAction =
    actions.find((action) => action.id === selectedId) ?? null;

  const toggleAction = (actionId: string) => {
    setSelectedId((currentId) => (currentId === actionId ? null : actionId));
    setDecision(null);
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
      setSelectedId(recommendations[0]?.id ?? null);

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
      setSelectedId(null);
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
      <Card className="min-w-0 overflow-hidden border border-card-border p-5 lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-text-primary">
              Hành động tiếp theo
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
              Đề xuất cần bạn xem xét trước khi tạo Task cho {data.student.name}
              .
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {actions.length > 0 && (
              <span className="rounded-full bg-background-soft-50 px-3 py-1 text-xs font-medium text-text-secondary">
                {actions.length} đề xuất đang mở
              </span>
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
          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-card-border bg-background-soft-50 p-3 text-text-secondary">
            <InfoTriangle
              size={16}
              className="mt-0.5 shrink-0 text-text-tertiary"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium text-text-primary">
                Chưa có hành động được đề xuất.
              </p>
              <p className="mt-1 text-xs leading-5">
                Hệ thống sẽ cập nhật khi có tín hiệu mới hoặc một lần đánh giá
                NBA hoàn tất.
              </p>
            </div>
          </div>
        )}

        {!query.isLoading && !query.isError && actions.length > 0 && (
          <div className="mt-5 space-y-3" aria-label="Danh sách đề xuất NBA">
            {actions.map((action) => (
              <StudentNbaRecommendationCard
                key={action.id}
                recommendation={action}
                isSelected={selectedAction?.id === action.id}
                onSelect={() => toggleAction(action.id)}
                onBeginDecision={beginDecision}
              />
            ))}
          </div>
        )}
      </Card>

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
