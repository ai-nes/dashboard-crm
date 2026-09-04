"use client";

import { CheckCircle1 } from "@tailgrids/icons";
import { useMemo } from "react";
import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
import {
  AnalysisSourceCountBadge,
  getAnalysisSourceCount,
} from "@/components/analysis-runs/analysis-report-signal-lists";
import type { AnalysisReportItem } from "@/services/api/analysis-runs";
import type { Student360Data } from "@/services/api/students/types";
import { displayValue } from "@/utils/display-value";
import {
  formatAnalysisLevel,
  formatClaimConfidence,
} from "@/components/analysis-runs/analysis-run-meta";
import StudentAICardHeader from "./student-ai-card-header";
import StudentCardEmptyState from "./student-card-empty-state";

interface StudentPositiveFeedbackCardProps {
  data: Student360Data;
  opportunities?: AnalysisReportItem[];
  recommendations?: AnalysisReportItem[];
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function StudentPositiveFeedbackCard({
  data,
  opportunities = [],
  recommendations = [],
  isRefreshing,
  onRefresh,
}: StudentPositiveFeedbackCardProps) {
  const sourceCount = getAnalysisSourceCount([
    ...recommendations.map((item) => ({ evidenceRefs: item.provenanceIds })),
    ...opportunities.map((item) => ({ evidenceRefs: item.provenanceIds })),
  ]);
  // Aggregate positive signals from AI recommendations, insight.evidence, and classification dimensions
  const allPositives = useMemo(() => {
    const items: Array<{
      headline: string;
      detail: string;
      evidence?: string[];
      badgeText?: string;
    }> = [];

    // 1. From Analysis Run report recommendations & opportunities
    const allReportItems = [...recommendations, ...opportunities];
    const seenHeadlines = new Set<string>();

    allReportItems.forEach((rec) => {
      if (seenHeadlines.has(rec.headline)) return;
      seenHeadlines.add(rec.headline);
      const confidence = formatClaimConfidence(rec.confidence);
      items.push({
        headline: rec.headline,
        detail: rec.detail,
        evidence: rec.provenanceIds,
        badgeText: rec.strength
          ? `Mức độ ${formatAnalysisLevel(rec.strength)}`
          : confidence?.label ??
            (rec.kind === "opportunity"
              ? "Cơ hội tuyển sinh"
              : "Khuyến nghị 360"),
      });
    });

    // 2. From Student360 classification (fit and interest)
    const dimensions = data.classification?.dimensions || [];
    const fit = dimensions.find((d) => d.id === "fit");
    if (fit && typeof fit.value === "string" && fit.value.toLowerCase().includes("cao")) {
      items.push({
        headline: `Nền tảng học tập: ${fit.value}`,
        detail: fit.description || "Hồ sơ học tập phù hợp với yêu cầu đầu vào.",
        evidence: fit.evidence,
        badgeText: "Phù hợp cao",
      });
    }

    // 3. From Student360 insight evidence (+points)
    if (data.insight?.evidence && Array.isArray(data.insight.evidence)) {
      data.insight.evidence.slice(0, 3).forEach((ev) => {
        const evStr = displayValue(ev);
        if (!evStr) return;
        const parts = evStr.split(/[·•]/);
        const action = displayValue(parts[0]) ?? evStr;
        const rest = displayValue(parts[1]);

        items.push({
          headline: action,
          detail: rest ?? "",
          badgeText: undefined,
        });
      });
    }

    return items;
  }, [opportunities, recommendations, data]);

  const hasPositives = allPositives.length > 0;

  return (
    <Card className="min-w-0 overflow-hidden border border-card-border p-5 lg:p-6">
      <StudentAICardHeader
        title="Tín hiệu thuận lợi"
        rightAction={<AnalysisSourceCountBadge count={sourceCount} />}
        timestamp={
          data.classification.updatedAt
            ? `Cập nhật lúc ${data.classification.updatedAt}`
            : "Được ghi nhận từ các điểm chạm chuyển đổi tích cực"
        }
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      <div className="mt-4">
        {hasPositives ? (
          <div className="space-y-3">
            {allPositives.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-3 rounded-xl border border-card-border bg-background-soft-50/70 p-3.5 text-xs text-text-primary dark:bg-card-background/60"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <CheckCircle1
                    size={16}
                    className="mt-0.5 shrink-0 text-success-500"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary">{item.headline}</p>
                    {item.detail && <p className="mt-1 leading-relaxed text-text-secondary">{item.detail}</p>}
                  </div>
                </div>
                {item.badgeText && (
                  <Badge color="success" size="sm" className="shrink-0">
                    {item.badgeText}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <StudentCardEmptyState message="Chưa có phản hồi trực tiếp từ học sinh hoặc phụ huynh." />
        )}
      </div>
    </Card>
  );
}
