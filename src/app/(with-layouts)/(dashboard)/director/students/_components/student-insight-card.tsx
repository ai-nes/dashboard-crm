"use client";

import { useState, type ReactNode } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/tailgrids/core/tooltip";
import { Sparkle, RefreshCircle1Clockwise } from "@tailgrids/icons";
import { Card } from "@/components/tailgrids/core/card";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import type { StudentAiOverview } from "@/services/api/student-ai";
import { formatDateTime } from "@/utils/format-date";

interface StudentInsightCardProps {
  children?: ReactNode;
  overview?: StudentAiOverview;
  canRead: boolean;
  onAnalyze?: () => void;
  isBusy: boolean;
  isLoading: boolean;
  hasError: boolean;
  hasTarget: boolean;
  embedded?: boolean;
  compact?: boolean;
  showAnalyze?: boolean;
}

export default function StudentInsightCard({
  children,
  overview,
  canRead,
  onAnalyze,
  isBusy,
  isLoading,
  hasError,
  hasTarget,
  embedded = false,
  compact = false,
  showAnalyze = true,
}: StudentInsightCardProps) {
  const analysis = canRead ? overview?.analysis : null;
  const card = analysis?.insight.insight_card;
  const status = card?.status_label
    ? overview?.labels.status[card.status_label]
    : null;
  const serviceDisabled = overview?.enabled === false;
  const notice =
    isLoading && !canRead
      ? "Đang tải phân tích."
      : !canRead
        ? "Bạn không có quyền xem phân tích học sinh."
        : hasError || overview?.state === "failed"
          ? "Chưa tải được phân tích mới nhất. Bạn có thể thử lại."
          : serviceDisabled
            ? "Dịch vụ phân tích chưa được bật cho hệ thống này."
            : isBusy
              ? "Đang cập nhật phân tích."
              : isLoading
                ? "Đang tải phân tích."
                : overview?.stale
                  ? "Dữ liệu học sinh đã thay đổi. Kết quả này cần được cập nhật."
                  : !analysis
                    ? onAnalyze
                      ? "Chưa có phân tích. Chọn Phân tích để tạo đánh giá từ dữ liệu học sinh."
                      : "Chưa có phân tích được lưu cho học sinh này."
                    : null;

  const pointsList = card?.points?.length ? (
    <ul
      className={
        compact
          ? "list-disc space-y-1 pl-4 text-xs leading-5 text-text-secondary"
          : "list-disc space-y-2 pl-5 text-sm leading-6 text-text-secondary"
      }
    >
      {card.points.map((point, index) => (
        <li className="break-words" key={index}>
          {point}
        </li>
      ))}
    </ul>
  ) : null;
  const [summaryOpen, setSummaryOpen] = useState(false);
  if (compact && canRead && children) {
    return (
      <Tooltip
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        placement="bottom-end"
      >
        <TooltipTrigger
          asChild
          aria-label="Tóm tắt phân tích"
          aria-description={card?.headline ?? undefined}
          onPointerEnter={() => setSummaryOpen(true)}
          onPointerLeave={() => setSummaryOpen(false)}
          onFocus={() => setSummaryOpen(true)}
          onBlur={() => setSummaryOpen(false)}
          onClick={() => setSummaryOpen(true)}
        >
          <div
            tabIndex={0}
            className="min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
          >
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent
          onPointerEnter={() => setSummaryOpen(true)}
          onPointerLeave={() => setSummaryOpen(false)}
          className="z-50 block w-80 max-w-[calc(100vw-24px)] space-y-2 break-words p-3 font-normal [&_ul]:text-inherit"
        >
          <h3 className="text-sm font-semibold">Tóm tắt phân tích</h3>
          <p className="text-sm font-medium">
            {card?.headline || "Chưa có tóm tắt phân tích."}
          </p>
          {pointsList}
          {notice && (
            <p role="status" className="text-xs">
              {notice}
            </p>
          )}
          {analysis?.generated_at && (
            <p className="text-xs">
              Cập nhật: {formatDateTime(analysis.generated_at)}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }
  const Container = embedded ? "div" : Card;
  return (
    <Container
      className={
        compact
          ? "flex h-full min-w-0 flex-col p-3"
          : "flex h-full min-w-0 flex-col p-4 sm:p-5"
      }
    >
      {!embedded && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
            <Sparkle size={20} aria-hidden="true" />
            Tóm tắt phân tích
          </h2>
          {status && (
            <Badge color="primary" size="sm">
              {status}
            </Badge>
          )}
        </div>
      )}
      {canRead && isLoading && !analysis ? (
        <div className="mt-6 space-y-3" aria-hidden="true">
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : (
        card && (
          <div className={compact ? "space-y-2" : "mt-4 space-y-3"}>
            <p
              className={
                compact
                  ? "break-words text-sm font-semibold leading-6 text-text-primary"
                  : "break-words text-lg font-semibold leading-7 text-text-primary"
              }
            >
              {card.headline?.trim() || "Chưa có câu tóm tắt cho hồ sơ này."}
            </p>
            {pointsList &&
              (compact ? (
                <details>
                  <summary className="cursor-pointer text-xs text-text-secondary">
                    Chi tiết
                  </summary>
                  {pointsList}
                </details>
              ) : (
                pointsList
              ))}
          </div>
        )
      )}
      {notice && (
        <p role="status" className="mt-5 text-sm leading-6 text-text-secondary">
          {notice}
        </p>
      )}
      {!compact && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-card-border pt-3">
          <p className="text-xs text-text-secondary">
            {analysis ? (
              <>
                Cập nhật:{" "}
                <time dateTime={analysis.generated_at}>
                  {formatDateTime(analysis.generated_at)}
                </time>
              </>
            ) : (
              "Chưa có kết quả được lưu"
            )}
          </p>
          {showAnalyze && canRead && onAnalyze && (
            <Button
              size="sm"
              className="min-h-11"
              onPress={onAnalyze}
              isDisabled={isBusy || isLoading || !hasTarget || serviceDisabled}
            >
              {isBusy ? (
                <RefreshCircle1Clockwise
                  className="motion-safe:animate-spin"
                  size={16}
                  aria-hidden="true"
                />
              ) : (
                <Sparkle size={16} aria-hidden="true" />
              )}
              {isBusy
                ? "Đang phân tích"
                : analysis
                  ? "Phân tích lại"
                  : "Phân tích"}
            </Button>
          )}
        </div>
      )}
    </Container>
  );
}
