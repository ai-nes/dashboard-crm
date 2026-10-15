"use client";

import { InfoTriangle, RefreshCircle1Clockwise } from "@tailgrids/icons";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/components/common/auth/auth-provider";
import {
  canAccessStudent,
  getCrmDoctypePermissions,
  getCrmPermissions,
  hasCrmCapability,
} from "@/components/common/auth/permissions";
import { Badge } from "@/components/tailgrids/core/badge";
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
import { getBusinessRouteKey } from "@/utils/business-record-route";
import StudentNbaRecommendationCard from "./student-nba-recommendation-card";
import StudentNbaDecisionDialog from "./student-nba-decision-dialog";
import { getStudentInternalId } from "./student-identifiers";
import { studentStatusOptions } from "./student-status";
import {
  NBA_OPERATION_LABELS,
  type DecisionFields,
  formatNbaEvaluationFailure,
  toIsoDateTime,
} from "./student-nba-ui";

interface StudentNextBestActionsProps {
  data: Student360Data;
  studentId: string;
  isAnalysisActive?: boolean;
  showRunButton?: boolean;
  headerAction?: ReactNode;
  analysisDisposition?: "RECOMMEND" | "NO_ACTION" | "STOPPED";
}

export default function StudentNextBestActions({
  data,
  studentId,
  isAnalysisActive = false,
  showRunButton = true,
  headerAction,
  analysisDisposition,
}: StudentNextBestActionsProps) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const permissions = getCrmPermissions(user);
  const recommendationPermissions = getCrmDoctypePermissions(
    user,
    "CRM Recommendation",
  );
  const decisionEventPermissions = getCrmDoctypePermissions(
    user,
    "CRM Student Decision Event",
  );
  const taskPermissions = getCrmDoctypePermissions(user, "Task");
  const canReadWorklist =
    !isAuthLoading &&
    canAccessStudent(
      permissions.student,
      { owner: data.student.counselor, ownerId: data.student.ownerId },
      user,
    ) &&
    recommendationPermissions.canRead;
  const canRunNba =
    canReadWorklist &&
    recommendationPermissions.canCreate &&
    hasCrmCapability(user, "recommendation.decide");
  const canDecide =
    canReadWorklist &&
    recommendationPermissions.canUpdate &&
    decisionEventPermissions.canCreate &&
    hasCrmCapability(user, "recommendation.decide");
  const canAccept =
    canDecide &&
    taskPermissions.canCreate &&
    hasCrmCapability(user, "action.execute");
  const studentStage = data.student.studentStage;
  const studentStageKnown = studentStage
    ? studentStatusOptions.includes(studentStage)
    : false;
  // NBA follows the AI pipeline: enrollment does not stop follow-up actions.
  const nbaStopped = studentStage === "Disqualified";
  const nbaBlocked = !studentStageKnown || nbaStopped;
  const canGenerateNba = canRunNba && !nbaBlocked;
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
    enabled: Boolean(studentId.trim()) && canReadWorklist,
    refetchInterval: isAnalysisActive ? 3000 : false,
  });
  const decisionMutation = useDecideNbaRecommendation();
  const runMutation = useRunStudentNbaEvaluation();
  const refetchWorklist = query.refetch;
  const wasAnalysisActive = useRef(isAnalysisActive);

  useEffect(() => {
    if (wasAnalysisActive.current && !isAnalysisActive) void refetchWorklist();
    wasAnalysisActive.current = isAnalysisActive;
  }, [isAnalysisActive, refetchWorklist]);

  useEffect(() => {
    if (!query.error) return;

    toast.error("Chưa thể đồng bộ đề xuất NBA", {
      description: nbaErrorMessage(query.error),
    });
  }, [query.error]);

  const worklistActions = useMemo(
    // The endpoint applies the student filter and resolves legacy Lead
    // ids to the canonical CRM Student id before returning this list.
    () => (nbaBlocked ? [] : (query.data?.items ?? []).slice(0, 3)),
    [query.data?.items, nbaBlocked],
  );
  const actions = useMemo(() => {
    if (nbaBlocked) return [];
    if (postRecommendations === null) return worklistActions;

    return postRecommendations.slice(0, 3).map((recommendation) => {
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
  }, [nbaBlocked, postRecommendations, worklistActions]);
  const beginDecision = (
    recommendation: NbaRecommendation,
    operation: NbaDecisionOperation,
  ) => {
    if (!canDecide || (operation.startsWith("ACCEPT") && !canAccept)) return;
    if (decisionMutation.isPending) return;
    setDecision({ recommendation, operation });
  };

  const cancelDecision = () => {
    if (!decisionMutation.isPending) setDecision(null);
  };

  const runNba = async () => {
    if (!canRunNba) return;
    try {
      const result = await runMutation.mutateAsync({ studentId });
      const normalizedStatus = result.status.trim().toLowerCase();
      if (normalizedStatus === "queued" || normalizedStatus === "running") {
        setPostRecommendations(null);
        toast.success(
          "Đã yêu cầu đánh giá NBA. Đề xuất sẽ được cập nhật khi phân tích hoàn tất.",
        );
        return;
      }
      if (
        normalizedStatus === "failed" ||
        normalizedStatus === "dead_lettered"
      ) {
        const message = formatNbaEvaluationFailure(result.terminalReason);
        setPostRecommendations(null);
        toast.error("Không thể tạo đề xuất NBA", { description: message });
        return;
      }
      const refreshed = await query.refetch();
      // The run endpoint is already scoped to this one requested student. Its
      // recommendation target uses the canonical CRM Student id, which may
      // differ from the legacy Lead id used by the detail route. If the
      // inline read-back is unavailable, use the permission-filtered worklist
      // returned by the same server-side scope instead of hiding new rows.
      const recommendations =
        result.recommendations.length > 0
          ? result.recommendations
          : result.recommendationCount > 0
            ? (refreshed.data?.items ?? [])
            : [];
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
    if (!canDecide || (operation.startsWith("ACCEPT") && !canAccept)) return;
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
        const studentRouteKey = getBusinessRouteKey(
          data.student.code,
          getStudentInternalId(data.student) || studentId,
        );
        router.push(
          `/director/students/${encodeURIComponent(studentRouteKey)}?tab=activities&taskId=${encodeURIComponent(result.action)}`,
        );
      } else {
        toast.success(decisionSuccessMessage(operation));
      }
    } catch (error) {
      toast.error(decisionErrorMessage(error));
    }
  };

  if (isAuthLoading) {
    return (
      <section
        aria-labelledby="next-best-actions-heading"
        className="@container/nba flex h-full min-w-0 flex-col"
      >
        <NbaPanelSkeleton />
      </section>
    );
  }

  if (!canReadWorklist) {
    return (
      <Card className="border-warning-200 bg-badge-warning-background p-5 text-badge-warning-text">
        <p className="font-semibold text-base">
          Bạn không có quyền xem đề xuất hành động của học sinh.
        </p>
        <p className="mt-1 text-sm">
          Cần quyền đọc hồ sơ học sinh trong phạm vi được cấp và quyền đọc đề
          xuất.
        </p>
      </Card>
    );
  }

  return (
    <>
      <section
        aria-labelledby="next-best-actions-heading"
        className="@container/nba flex h-full min-w-0 flex-col"
      >
        <div className="flex min-h-10 flex-wrap items-center justify-between gap-2">
          <h2
            id="next-best-actions-heading"
            className="flex items-center gap-2 text-base font-semibold text-text-primary"
          >
            Hành động tiếp theo
            {canReadWorklist && actions.length > 0 && (
              <Badge color="gray" size="sm">
                {actions.length}
              </Badge>
            )}
          </h2>
          {headerAction}
          {showRunButton && (
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="primary"
                appearance="outline"
                size="sm"
                onPress={() =>
                  canGenerateNba ? void runNba() : void query.refetch()
                }
                isDisabled={
                  query.isFetching ||
                  runMutation.isPending ||
                  isAnalysisActive ||
                  decisionMutation.isPending
                }
              >
                <RefreshCircle1Clockwise
                  className={
                    query.isFetching ||
                    runMutation.isPending ||
                    isAnalysisActive
                      ? "motion-safe:animate-spin"
                      : undefined
                  }
                  size={16}
                  aria-hidden="true"
                />
                {runMutation.isPending || isAnalysisActive
                  ? "Đang phân tích NBA…"
                  : query.isFetching
                    ? "Đang tải NBA…"
                    : canGenerateNba
                      ? "Gợi ý & tải lại NBA"
                      : "Tải lại NBA"}
              </Button>
            </div>
          )}
        </div>

        {nbaStopped && (
          <div
            className="mt-4 rounded-lg border border-card-border bg-background-gray-secondary px-3 py-2.5 text-xs leading-5 text-text-secondary"
            role="status"
          >
            Học sinh không đủ điều kiện; hiện không phát sinh NBA mới.
          </div>
        )}

        {!studentStageKnown && (
          <div
            className="mt-4 rounded-lg border border-card-border bg-background-gray-secondary px-3 py-2.5 text-xs leading-5 text-text-secondary"
            role="status"
          >
            Student stage chưa được xác định; hệ thống tạm thời chưa phát sinh
            NBA cho hồ sơ này.
          </div>
        )}

        {query.isLoading && <NbaPanelSkeleton />}

        {!query.isLoading && !query.isError && actions.length === 0 && (
          <div
            className="mt-8 flex flex-col items-center px-4 py-8 text-center"
            role="status"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-background-gray-secondary text-text-tertiary">
              <InfoTriangle size={18} aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-semibold text-text-primary">
              {isAnalysisActive
                ? "Đang phân tích NBA…"
                : analysisDisposition === "NO_ACTION"
                  ? "AI đã phân tích, chưa có hành động phù hợp"
                  : "Chưa có hành động phù hợp lúc này"}
            </p>
            <p className="mt-1 max-w-md text-xs leading-5 text-text-secondary">
              {isAnalysisActive
                ? "NBA và biểu đồ sẽ được cập nhật khi phân tích hoàn tất."
                : analysisDisposition === "NO_ACTION"
                  ? "Bổ sung thông tin hoặc tương tác mới, rồi chọn Phân tích lại để đánh giá lại cả NBA và biểu đồ."
                  : (query.data?.emptyReason ??
                    "Chưa có đề xuất đang chờ xử lý cho học sinh này.")}
            </p>
          </div>
        )}

        {!query.isLoading && !query.isError && actions.length > 0 && (
          <div
            className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-4 @xl/nba:grid-cols-2 @3xl/nba:grid-cols-3"
            aria-label="Danh sách đề xuất NBA"
          >
            {actions.map((action) => (
              <StudentNbaRecommendationCard
                key={action.id}
                recommendation={action}
                onBeginDecision={beginDecision}
                canDecide={canDecide}
                canAccept={canAccept}
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
    <div
      className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-4 @xl/nba:grid-cols-2 @3xl/nba:grid-cols-3"
      role="status"
      aria-live="polite"
    >
      {["w-36", "w-11/12", "w-4/5"].map((width, index) => (
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
