"use client";

import { Sparkle } from "@tailgrids/icons";
import {
  AnalysisSourceCountBadge,
  getAnalysisSourceCount,
} from "@/components/analysis-runs/analysis-report-signal-lists";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import type { AnalysisReport } from "@/services/api/analysis-runs";
import { AnalysisAdvisorySignalList } from "@/components/analysis-runs/analysis-report-signal-lists";
import StudentAICardHeader from "./student-ai-card-header";
import StudentCardEmptyState from "./student-card-empty-state";

interface StudentContactInsightsCardProps {
  report?: AnalysisReport | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onOpenAskAI?: () => void;
}

export default function StudentContactInsightsCard({
  report,
  isRefreshing,
  onRefresh,
  onOpenAskAI,
}: StudentContactInsightsCardProps) {
  const advisorySignals = report?.advisorySignals ?? [];
  const hasOverview = Boolean(report?.title || report?.summary);
  const hasAnalysis = hasOverview || advisorySignals.length > 0;

  return (
    <Card className="min-w-0 overflow-hidden border border-card-border p-5 lg:p-6">
      <StudentAICardHeader
        description="Các tín hiệu chính giúp chọn hướng tư vấn tiếp theo."
        icon={<Sparkle size={18} aria-hidden="true" />}
        title="Tín hiệu tư vấn tuyển sinh"
        rightAction={
          <AnalysisSourceCountBadge
            count={getAnalysisSourceCount(advisorySignals)}
          />
        }
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      {/* Hiển thị overview và toàn bộ advisory_signals từ Analysis Run report. */}
      {hasAnalysis ? (
        <>
          {hasOverview && (
            <div className="mt-4 rounded-xl border border-card-border bg-background-soft-50/50 p-4 text-sm leading-relaxed text-text-primary sm:p-5">
              {report?.title && <p className="font-semibold">{report.title}</p>}
              {report?.summary && (
                <p className="mt-1 text-text-secondary">{report.summary}</p>
              )}
            </div>
          )}
          <AnalysisAdvisorySignalList items={advisorySignals} />
        </>
      ) : (
        <div className="mt-4 rounded-xl border border-card-border bg-background-soft-50/50 p-4 sm:p-5">
          <StudentCardEmptyState message="Chưa có phân tích cho hồ sơ này." />
        </div>
      )}

      {/* Action button */}
      <div className="mt-4">
        <Button
          appearance="outline"
          size="xs"
          onPress={onOpenAskAI}
          className="rounded-full font-medium"
        >
          <Sparkle size={13} aria-hidden="true" />
          <span>Đặt câu hỏi cho AI</span>
        </Button>
      </div>
    </Card>
  );
}
