"use client";

import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  InfoTriangle,
} from "@tailgrids/icons";
import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import type { AnalysisReport } from "@/services/api/analysis-runs";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

import StudentAICardHeader from "../../students/_components/student-ai-card-header";
import {
  displaySchoolValue,
  formatSchoolConfidence,
  schoolAnalysisTimestamp,
} from "./school-analysis-display";

interface SchoolContactInsightsCardProps {
  data: SchoolIntelligenceData;
  report: AnalysisReport | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onOpenDetails?: () => void;
}

export default function SchoolContactInsightsCard({
  data,
  report,
  isRefreshing,
  onRefresh,
  onOpenDetails,
}: SchoolContactInsightsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const topRecommendation =
    report?.recommendations.find((item) => item.kind === "recommendation") ??
    report?.recommendations[0];
  const classificationAction = displaySchoolValue(
    data.classificationResponse?.action ?? data.classification.action,
  );
  const classificationGroup = displaySchoolValue(
    data.classificationResponse?.group ?? data.classification.group,
  );
  const classificationLabel = displaySchoolValue(
    data.classificationResponse?.label ?? data.classification.label,
  );
  const topRisk = report?.risks[0];
  const topOpportunity = report?.recommendations.find(
    (item) => item.kind === "opportunity",
  );
  const recommendationConfidence = formatSchoolConfidence(
    topRecommendation?.confidence,
  );
  const hasContent = Boolean(
    report?.title ||
    report?.summary ||
    classificationGroup ||
    classificationLabel ||
    topRecommendation ||
    classificationAction ||
    topRisk ||
    topOpportunity,
  );
  const hasDetails = Boolean(
    recommendationConfidence || report?.missingEvidence?.length,
  );

  return (
    <Card className="min-w-0 overflow-hidden border border-card-border p-5 lg:p-6">
      <StudentAICardHeader
        title="Tín hiệu tuyển sinh tại trường"
        timestamp={schoolAnalysisTimestamp(data.dataFreshness)}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      <div className="mt-4 rounded-xl border border-primary-500/30 bg-badge-primary-background/30 p-4 sm:p-5 dark:border-primary-500/50">
        {hasContent ? (
          <ul className="space-y-3.5 text-sm leading-relaxed text-text-primary">
            {(report?.title || report?.summary) && (
              <li className="list-disc pl-1 ml-4">
                {report.title && (
                  <p>
                    <span className="font-semibold">Ưu tiên chiến lược:</span>{" "}
                    {report.title}
                  </p>
                )}
                {report.summary && (
                  <p className="mt-1 text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary">
                      Đánh giá từ School 360:
                    </span>{" "}
                    {report.summary}
                  </p>
                )}
              </li>
            )}

            {(classificationGroup || classificationLabel) && (
              <li className="list-disc pl-1 ml-4">
                <span className="font-semibold">Mức độ ưu tiên:</span>{" "}
                {classificationGroup}
                {classificationGroup && classificationLabel ? " · " : ""}
                {classificationLabel}
              </li>
            )}

            {(topRecommendation || classificationAction) && (
              <li className="list-disc pl-1 ml-4">
                <span className="font-semibold">Việc cần làm ngay:</span>{" "}
                {topRecommendation?.headline ?? classificationAction}
                {topRecommendation?.detail && (
                  <p className="mt-1 text-xs text-text-secondary">
                    {topRecommendation.detail}
                  </p>
                )}
              </li>
            )}

            {topRisk && (
              <li className="list-disc pl-1 ml-4">
                <span className="font-semibold">Rào cản cần xử lý:</span>{" "}
                {topRisk.headline}
                {topRisk.detail && (
                  <p className="mt-1 text-xs text-text-secondary">
                    {topRisk.detail}
                  </p>
                )}
              </li>
            )}

            {topOpportunity && (
              <li className="list-disc pl-1 ml-4">
                <span className="font-semibold">Cơ hội phát triển:</span>{" "}
                {topOpportunity.headline}
                {topOpportunity.detail && (
                  <p className="mt-1 text-xs text-text-secondary">
                    {topOpportunity.detail}
                  </p>
                )}
              </li>
            )}

            {isExpanded && (
              <>
                {recommendationConfidence && (
                  <li className="list-disc pl-1 ml-4 text-text-secondary">
                    <span className="font-semibold text-text-primary">
                      Độ tin cậy hành động:
                    </span>{" "}
                    {recommendationConfidence}
                  </li>
                )}

                {report?.missingEvidence &&
                  report.missingEvidence.length > 0 && (
                    <li className="list-disc pl-1 ml-4 text-text-secondary">
                      <span className="font-semibold text-text-primary">
                        Dữ liệu cần bổ sung:
                      </span>{" "}
                      {report.missingEvidence.join(" · ")}
                    </li>
                  )}
              </>
            )}
          </ul>
        ) : (
          <div
            className="min-h-24"
            aria-label="Chưa có dữ liệu tín hiệu tư vấn"
          />
        )}

        {hasDetails && (
          <button
            type="button"
            onClick={() => setIsExpanded((previous) => !previous)}
            className="mx-auto mt-4 flex cursor-pointer items-center gap-1 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary focus:outline-hidden"
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <>
                <ChevronUp size={14} aria-hidden="true" />
                Thu gọn
              </>
            ) : (
              <>
                <ChevronDown size={14} aria-hidden="true" />
                Xem thêm chi tiết
              </>
            )}
          </button>
        )}
      </div>

      {report && onOpenDetails && (
        <div className="mt-4 flex items-center gap-2">
          <Button appearance="ghost" size="xs" onPress={onOpenDetails}>
            <InfoTriangle size={14} aria-hidden="true" />
            Xem toàn bộ kết quả
            <ArrowRight size={14} aria-hidden="true" />
          </Button>
          {topRecommendation?.kind === "opportunity" && (
            <Badge color="success" size="sm">
              Cơ hội
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
}
