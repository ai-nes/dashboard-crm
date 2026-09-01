"use client";

import {
  ErrorCircle1,
  RefreshCircle1Clockwise,
  Sparkle,
} from "@tailgrids/icons";
import { useState } from "react";

import { useAnalysisRun } from "@/hooks/use-analysis-run";
import { Button } from "@/components/tailgrids/core/button";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import {
  AnalysisRunApiError,
  type AnalysisRunKind,
} from "@/services/api/analysis-runs";
import { cn } from "@/utils/cn";

import AnalysisActivityFeed from "./analysis-activity-feed";
import AnalysisCompactCard from "./analysis-compact-card";
import AnalysisDrawer from "./analysis-drawer";

interface AnalysisRunPanelProps {
  kind: AnalysisRunKind;
  targetId: string;
  title?: string;
  description?: string;
  className?: string;
  embedded?: boolean;
}

export default function AnalysisRunPanel({
  kind,
  targetId,
  title = "Phân tích AI",
  description = "Tóm lược 360° và khuyến nghị hành động tối ưu.",
  className,
  embedded = false,
}: AnalysisRunPanelProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { run, request, requestMutation, runQuery } = useAnalysisRun(
    kind,
    targetId,
  );
  const isActive = run?.status === "queued" || run?.status === "running";

  const handleRequest = () => {
    if (!targetId.trim() || requestMutation.isPending || isActive) return;
    request(
      kind === "student"
        ? { kind, studentId: targetId }
        : { kind, highSchool: targetId },
    );
  };

  const requestError = requestMutation.error;
  const pollingError = runQuery.error;
  const error = requestError ?? pollingError;
  // React Query keeps a disabled query in the `pending` state. Use
  // `isLoading` here because it is only true while an enabled query is
  // actually fetching; otherwise a school with no stored run reference would
  // show a skeleton forever and hide the initial action button.
  const isInitialLoading = !run && runQuery.isLoading && !error;

  return (
    <section
      aria-labelledby={`${kind}-analysis-heading`}
      aria-busy={isInitialLoading || isActive}
      className={cn("scroll-mt-20", className)}
    >
      <div
        className={cn(
          embedded ? "border-t border-card-border px-5 py-4 lg:px-6" : "p-0",
        )}
      >
        {error && (
          <div
            className="mb-3 flex items-start gap-2 rounded-xl border border-error-200 bg-badge-error-background p-3 text-sm text-error-600"
            role="alert"
          >
            <ErrorCircle1
              size={17}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium">{analysisErrorTitle(error)}</p>
              <p className="mt-1 text-xs leading-5">
                {analysisErrorMessage(error)}
              </p>
              <Button
                size="xs"
                appearance="outline"
                onPress={handleRequest}
                isDisabled={
                  !targetId.trim() || requestMutation.isPending || isActive
                }
                className="mt-3"
              >
                <RefreshCircle1Clockwise size={13} aria-hidden="true" />
                Thử lại
              </Button>
            </div>
          </div>
        )}

        {isInitialLoading && (
          <div className="py-2" aria-live="polite">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="w-32" />
                <Skeleton className="w-56 max-w-full" />
              </div>
            </div>
          </div>
        )}

        {!run && !isInitialLoading && !error && (
          <div className="flex flex-col gap-4 py-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-badge-primary-background text-primary-600"
                aria-hidden="true"
              >
                <Sparkle size={16} />
              </div>
              <div className="min-w-0">
                <h3
                  id={`${kind}-analysis-heading`}
                  className="text-sm font-semibold text-text-primary"
                >
                  {title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
                  {description ||
                    "Chạy phân tích để nhận đề xuất và tín hiệu từ dữ liệu hiện tại."}
                </p>
              </div>
            </div>
            <Button
              onPress={handleRequest}
              isDisabled={!targetId.trim() || requestMutation.isPending}
            >
              <Sparkle size={16} aria-hidden="true" />
              Chạy phân tích
            </Button>
          </div>
        )}

        {run && (
          <div>
            {isActive ? (
              <AnalysisActivityFeed run={run} title={title} />
            ) : (
              <>
                {/* Thẻ hiển thị tóm lược siêu gọn trên Dashboard */}
                <AnalysisCompactCard
                  kind={kind}
                  targetId={targetId}
                  title={title}
                  description={description}
                  run={run}
                  isActive={Boolean(isActive)}
                  isPending={requestMutation.isPending}
                  onRequest={handleRequest}
                  onOpenDrawer={() => setIsDrawerOpen(true)}
                  embedded={embedded}
                />

                {/* Slide-over Drawer khi bấm xem chi tiết toàn bộ */}
                <AnalysisDrawer
                  isOpen={isDrawerOpen}
                  onOpenChange={setIsDrawerOpen}
                  run={run}
                  title={title}
                  kind={kind}
                  targetId={targetId}
                />
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function analysisErrorTitle(error: Error): string {
  if (error instanceof AnalysisRunApiError && error.status === 403)
    return "Không có quyền xem phân tích";
  if (
    error instanceof AnalysisRunApiError &&
    [409, 417, 422].includes(error.status)
  )
    return "Yêu cầu chưa được chấp nhận";
  if (error instanceof AnalysisRunApiError && error.status === 503)
    return "Dịch vụ phân tích tạm thời không khả dụng";
  if (error instanceof AnalysisRunApiError && error.status === 401)
    return "Phiên đăng nhập không còn hợp lệ";
  return "Không thể tải phân tích";
}

function analysisErrorMessage(error: Error): string {
  if (error instanceof AnalysisRunApiError && error.status === 403)
    return "Đối tượng này nằm ngoài phạm vi dữ liệu hiện tại.";
  if (
    error instanceof AnalysisRunApiError &&
    [409, 417, 422].includes(error.status)
  )
    return "Có thể đang có run khác, vượt giới hạn yêu cầu hoặc hệ thống chưa bật phân tích.";
  if (error instanceof AnalysisRunApiError && error.status === 401)
    return "Vui lòng đăng nhập lại để tiếp tục.";
  return error.message || "Vui lòng thử lại sau.";
}
