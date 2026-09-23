"use client";

import { useId, useState } from "react";
import type { AnalysisReport } from "@/services/api/analysis-runs";
import type { Student360Data } from "@/services/api/students/types";
import type { StudentScoreBreakdown } from "./student-score-breakdown";
import StudentVisual360Orbit from "./student-visual-360-orbit";
import StudentVisual360Panel from "./student-visual-360-panel";
import {
  visual360Sections,
  type Visual360SectionId,
} from "./student-visual-360-sections";

interface StudentVisual360Props {
  canRead: boolean;
  data: Student360Data;
  report: AnalysisReport | null;
  scoreBreakdown?: StudentScoreBreakdown | null;
  isLoading?: boolean;
  hasError?: boolean;
}

export default function StudentVisual360({
  canRead,
  data,
  report,
  scoreBreakdown,
  isLoading = false,
  hasError = false,
}: StudentVisual360Props) {
  const [selected, setSelected] = useState<Visual360SectionId>("signals");
  const panelId = useId();
  if (!canRead) return null;
  const section = visual360Sections.find((item) => item.id === selected)!;

  return (
    <section aria-label="Visual 360" className="min-w-0 space-y-5">
      <p className="text-sm text-text-secondary">
        Chọn một cung để xem phân tích.
      </p>
      {isLoading && (
        <p role="status" className="text-sm text-text-secondary">
          Đang cập nhật phân tích 360…
        </p>
      )}
      {hasError && (
        <p role="status" className="text-sm text-badge-warning-text">
          Chưa đồng bộ được phân tích mới nhất. Nội dung hiện có có thể chưa
          được cập nhật.
        </p>
      )}
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(280px,420px)_minmax(0,1fr)] lg:gap-8">
        <div className="min-w-0 py-2">
          <StudentVisual360Orbit
            student={data.student}
            selected={selected}
            onSelect={setSelected}
            panelId={panelId}
          />
        </div>
        <div
          id={panelId}
          role="region"
          aria-label={section.label}
          className="min-w-0"
        >
          <StudentVisual360Panel
            selected={selected}
            data={data}
            report={report}
            scoreBreakdown={scoreBreakdown}
            isLoading={isLoading}
            hasError={hasError}
          />
        </div>
      </div>
    </section>
  );
}
