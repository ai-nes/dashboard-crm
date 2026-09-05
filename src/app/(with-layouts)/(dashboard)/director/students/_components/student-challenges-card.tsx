"use client";

import { InfoTriangle } from "@tailgrids/icons";
import { useMemo } from "react";
import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
import {
  AnalysisSourceCountBadge,
  getAnalysisSourceCount,
} from "@/components/analysis-runs/analysis-report-signal-lists";
import type { AnalysisReportItem } from "@/services/api/analysis-runs";
import type { Student360Data } from "@/services/api/students/types";
import { cleanTextList, displayValue } from "@/utils/display-value";
import {
  formatAnalysisLevel,
  formatClaimConfidence,
} from "@/components/analysis-runs/analysis-run-meta";
import StudentAICardHeader from "./student-ai-card-header";
import StudentCardEmptyState from "./student-card-empty-state";

interface StudentChallengesCardProps {
  data: Student360Data;
  risks?: AnalysisReportItem[];
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function StudentChallengesCard({
  data,
  risks = [],
  isRefreshing,
  onRefresh,
}: StudentChallengesCardProps) {
  // Aggregate challenges from both AI run risks and Student360Data classification/concerns
  const allChallenges = useMemo(() => {
    const items: Array<{
      headline: string;
      detail?: string;
      evidence?: string[];
      badgeText?: string;
      badgeColor: "warning" | "error" | "gray";
    }> = [];

    // 1. From Analysis Run report risks
    if (risks && risks.length > 0) {
      risks.forEach((r) => {
        const confidence = formatClaimConfidence(r.confidence);
        items.push({
          headline: r.headline,
          detail: r.detail,
          evidence: r.provenanceIds,
          badgeText: r.severity
            ? `Mức độ ${formatAnalysisLevel(r.severity)}`
            : confidence?.label ?? "Rủi ro AI",
          badgeColor: "warning",
        });
      });
    }

    // 2. From Student360 classification barrier dimension
    const dimensions = data.classification?.dimensions || [];
    const barrier = dimensions.find((d) => d.id === "barrier");
    const barrierValue = displayValue(barrier?.value);
    if (barrierValue && barrierValue !== "Không có") {
      items.push({
        headline: `Rào cản tuyển sinh: ${barrierValue}`,
        detail: displayValue(barrier?.description) ?? undefined,
        evidence: barrier?.evidence,
        badgeText: "Rào cản chính",
        badgeColor: "warning",
      });
    }

    // 3. From Parent concerns if specific
    const concerns = cleanTextList(data.parentProfile?.concerns);
    if (concerns.length > 0) {
      const topConcern = concerns[0];
      if (!items.some((i) => i.detail?.includes(topConcern) || i.headline.includes(topConcern))) {
        items.push({
          headline: `Băn khoăn phụ huynh: ${topConcern}`,
          detail: `Phụ huynh (${data.parentProfile?.name}) đang cần thông tin rõ ràng về: ${concerns.join(", ")}.`,
          badgeText: "Ý kiến phụ huynh",
          badgeColor: "gray",
        });
      }
    }

    return items;
  }, [risks, data]);

  const hasChallenges = allChallenges.length > 0;

  return (
    <Card className="min-w-0 overflow-hidden border border-card-border p-5 lg:p-6">
      <StudentAICardHeader
        title="Rào cản tuyển sinh"
        rightAction={
          <AnalysisSourceCountBadge count={getAnalysisSourceCount(risks)} />
        }
        timestamp={
          data.classification.updatedAt
            ? `Cập nhật lúc ${data.classification.updatedAt}`
            : "Được phát hiện từ hồ sơ và lịch sử tương tác"
        }
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      <div className="mt-4">
        {hasChallenges ? (
          <div className="space-y-3">
            {allChallenges.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-3 rounded-xl border border-card-border bg-background-soft-50/70 p-3.5 text-xs text-text-primary dark:bg-card-background/60"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <InfoTriangle
                    size={16}
                    className="mt-0.5 shrink-0 text-warning-500"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary">{item.headline}</p>
                    {item.detail && <p className="mt-1 leading-relaxed text-text-secondary">{item.detail}</p>}
                  </div>
                </div>
                {item.badgeText && (
                  <Badge color={item.badgeColor} size="sm" className="shrink-0">
                    {item.badgeText}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <StudentCardEmptyState message="Chưa ghi nhận rào cản nào trên hồ sơ này." />
        )}
      </div>
    </Card>
  );
}
