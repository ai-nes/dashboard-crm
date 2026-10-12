"use client";

import { Card } from "@/components/tailgrids/core/card";
import type { Student360Data } from "@/services/api/students/types";
import StudentGaugeChart from "./student-gauge-chart";
import type { StudentScoreBreakdown } from "./student-score-breakdown";

interface Props {
  data: Student360Data;
  scoreBreakdown?: StudentScoreBreakdown | null;
}

export default function StudentOverviewScoreCard({
  data,
  scoreBreakdown,
}: Props) {
  const candidate = data.insight.signalScore ?? data.insight.probability;
  const score =
    typeof candidate === "number" && Number.isFinite(candidate)
      ? candidate
      : null;
  return (
    <Card className="flex h-full min-w-0 flex-col p-5 sm:p-6">
      <h2 className="text-base font-semibold text-text-primary">
        Điểm tiềm năng
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        Mức ưu tiên chăm sóc từ CRM.
      </p>
      <div className="flex flex-1 items-center justify-center py-6">
        {score === null ? (
          <p className="text-sm text-text-secondary">
            Chưa có dữ liệu điểm tiềm năng.
          </p>
        ) : (
          <StudentGaugeChart
            score={score}
            scoreBreakdown={scoreBreakdown}
            label="Điểm CRM"
          />
        )}
      </div>
    </Card>
  );
}
