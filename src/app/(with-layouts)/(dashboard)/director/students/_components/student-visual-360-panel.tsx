"use client";

import { AnalysisAdvisorySignalList } from "@/components/analysis-runs/analysis-report-signal-lists";
import { Card } from "@/components/tailgrids/core/card";
import type { AnalysisReport } from "@/services/api/analysis-runs";
import type { Student360Data } from "@/services/api/students/types";
import StudentChallengesCard from "./student-challenges-card";
import StudentPositiveFeedbackCard from "./student-positive-feedback-card";
import StudentRecentInteractionsCard from "./student-recent-interactions-card";
import StudentGaugeChart from "./student-gauge-chart";
import type { StudentScoreBreakdown } from "./student-score-breakdown";
import type { Visual360SectionId } from "./student-visual-360-sections";

interface StudentVisual360PanelProps {
  selected: Visual360SectionId;
  data: Student360Data;
  report: AnalysisReport | null;
  scoreBreakdown?: StudentScoreBreakdown | null;
  isLoading: boolean;
  hasError: boolean;
}

export default function StudentVisual360Panel({
  selected,
  data,
  report,
  scoreBreakdown,
  isLoading,
  hasError,
}: StudentVisual360PanelProps) {
  if (selected === "interactions")
    return (
      <StudentRecentInteractionsCard
        studentId={data.student.studentId}
        recentChanges={report?.recentChanges}
        isRefreshing={isLoading}
      />
    );
  if (selected === "challenges")
    return (
      <StudentChallengesCard
        compact
        data={data}
        risks={report?.risks ?? []}
        isRefreshing={isLoading}
      />
    );
  if (selected === "positives")
    return (
      <StudentPositiveFeedbackCard
        compact
        data={data}
        recommendations={
          report?.recommendations.filter(
            (item) => item.kind === "recommendation",
          ) ?? []
        }
        opportunities={
          report?.opportunities ??
          report?.recommendations.filter(
            (item) => item.kind === "opportunity",
          ) ??
          []
        }
        isRefreshing={isLoading}
      />
    );

  if (selected === "potential") {
    const candidate = data.insight.signalScore ?? data.insight.probability;
    const score =
      typeof candidate === "number" && Number.isFinite(candidate)
        ? candidate
        : null;
    return (
      <Card className="min-w-0 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-text-primary">
          Điểm tiềm năng
        </h3>
        {score === null ? (
          <p className="mt-6 text-sm text-text-secondary">
            Chưa có dữ liệu điểm tiềm năng cho hồ sơ này.
          </p>
        ) : (
          <div className="mx-auto my-6 max-w-72">
            <StudentGaugeChart
              score={score}
              label="Điểm tiềm năng"
              scoreBreakdown={scoreBreakdown}
            />
          </div>
        )}
        <p className="mt-4 text-sm leading-6 text-text-secondary">
          {report?.summary ||
            report?.advisorySignals?.[0]?.summary ||
            "Chưa có diễn giải phân tích cho hồ sơ này."}
        </p>
      </Card>
    );
  }

  const hasSignals = Boolean(
    report?.title || report?.summary || report?.advisorySignals?.length,
  );
  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <h3 className="text-base font-semibold text-text-primary">
        Tín hiệu tư vấn tuyển sinh
      </h3>
      {hasSignals ? (
        <>
          {report?.title && (
            <p className="mt-5 text-sm font-semibold text-text-primary">
              {report.title}
            </p>
          )}
          {report?.summary && (
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {report.summary}
            </p>
          )}
          <AnalysisAdvisorySignalList items={report?.advisorySignals ?? []} />
        </>
      ) : (
        <div className="py-6 text-sm leading-6 text-text-secondary">
          <p>
            {isLoading
              ? "Đang tải phân tích hồ sơ…"
              : hasError
                ? "Chưa tải được báo cáo phân tích."
                : "Chưa có phân tích cho hồ sơ này."}
          </p>
          <p className="mt-2">
            Kết quả sẽ hiển thị tại đây khi có dữ liệu từ Phân tích 360.
          </p>
        </div>
      )}
    </Card>
  );
}
