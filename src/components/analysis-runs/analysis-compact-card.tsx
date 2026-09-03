"use client";

import { ArrowRight, RefreshCircle1Clockwise, Sparkle } from "@tailgrids/icons";
import { useMemo } from "react";

import { Button } from "@/components/tailgrids/core/button";
import type {
  AnalysisRunKind,
  AnalysisRunSnapshot,
} from "@/services/api/analysis-runs";
import { cn } from "@/utils/cn";

import {
  getDeepAnalysisNotice,
  getRichReport,
} from "./analysis-run-meta";
import AnalysisReportCockpit from "./analysis-report-cockpit";

interface AnalysisCompactCardProps {
  kind: AnalysisRunKind;
  targetId: string;
  title: string;
  description?: string;
  run: AnalysisRunSnapshot;
  isActive: boolean;
  isPending: boolean;
  onRequest: () => void;
  onOpenDrawer: () => void;
  embedded?: boolean;
}

export default function AnalysisCompactCard({
  kind,
  targetId,
  title,
  run,
  isActive,
  isPending,
  onRequest,
  onOpenDrawer,
  embedded = false,
}: AnalysisCompactCardProps) {
  const report = useMemo(() => getRichReport(run.stages), [run.stages]);
  const deepAnalysisNotice = useMemo(() => getDeepAnalysisNotice(run), [run]);

  const requestLabel = isPending
    ? "Đang gửi"
    : isActive
      ? "Đang phân tích"
      : "Phân tích lại";

  return (
    <div
      className={cn(
        "min-w-0",
        !embedded &&
          "rounded-xl border border-card-border bg-card-background px-5 py-4 lg:px-6",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-badge-primary-background text-primary-600"
            aria-hidden="true"
          >
            <Sparkle size={16} />
          </div>
          <div className="min-w-0">
            <h3 id={`${kind}-analysis-heading`} className="text-sm font-semibold text-text-primary">
              {title}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            appearance="outline"
            size="sm"
            onPress={onRequest}
            isDisabled={!targetId.trim() || isPending || Boolean(isActive)}
            className="text-text-secondary"
          >
            <RefreshCircle1Clockwise
              size={15}
              className={cn(isActive && "motion-safe:animate-spin")}
              aria-hidden="true"
            />
            {requestLabel}
          </Button>

          <Button size="sm" onPress={onOpenDrawer}>
            <span>Xem báo cáo</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Button>
        </div>
      </div>

      {deepAnalysisNotice && (
        <p
          className="mt-4 rounded-lg border border-warning-200 bg-badge-warning-background px-3 py-2 text-xs leading-5 text-warning-700"
          role="status"
        >
          {deepAnalysisNotice}
        </p>
      )}

      {report ? (
        <div className="mt-5">
          <AnalysisReportCockpit
            report={report}
            onOpenDetails={onOpenDrawer}
          />
        </div>
      ) : (
        <div className="mt-5 border-t border-card-border pt-5 text-sm leading-6 text-text-secondary">
          Lần phân tích này chưa tạo được báo cáo có cấu trúc. Mở chi tiết để kiểm tra trạng thái và tín hiệu đã ghi nhận.
        </div>
      )}
    </div>
  );
}
