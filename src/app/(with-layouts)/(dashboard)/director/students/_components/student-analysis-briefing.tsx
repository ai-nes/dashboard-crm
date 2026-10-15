"use client";
import type { ReactNode } from "react";
import { Card } from "@/components/tailgrids/core/card";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import type { StudentAiOverview } from "@/services/api/student-ai";
import StudentAnalysisRadar from "./student-analysis-radar";
import type { AnalysisDimensionView } from "./student-analysis-view";

interface Props {
  headerAction?: ReactNode;
  summary?: (trigger: ReactNode) => ReactNode;
  overview?: StudentAiOverview;
  items: AnalysisDimensionView[];
  previous?: AnalysisDimensionView[];
  selectedCode: string;
  showPrevious: boolean;
  onTogglePrevious: () => void;
}
export default function StudentAnalysisBriefing({
  headerAction,
  summary,
  overview,
  items,
  previous,
  selectedCode,
  showPrevious,
  onTogglePrevious,
}: Props) {
  const statusCode = overview?.analysis?.insight.insight_card?.status_label;
  const status = statusCode ? overview?.labels.status[statusCode] : undefined;
  const hasPrevious = previous?.some((d) => d.score !== null);
  const radar = (
    <StudentAnalysisRadar
      compact={Boolean(summary)}
      dimensions={items}
      previous={previous}
      showPrevious={Boolean(showPrevious && hasPrevious)}
      selectedCode={selectedCode}
      generatedAt={overview?.analysis?.generated_at}
      previousAt={overview?.previous_analysis?.generated_at}
    />
  );
  return (
    <section
      className="@container/briefing min-w-0"
      aria-label="Tổng quan radar"
    >
      <header className="flex min-h-10 flex-wrap items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
          Radar tổng quan
        </h2>
        <div className="flex flex-wrap items-center gap-1">{headerAction}</div>
      </header>
      <Card className="mt-3 min-w-0 overflow-hidden p-0">
        <div className="min-w-0">{summary ? summary(radar) : radar}</div>
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-card-border px-3 py-2 text-xs text-text-secondary">
          {status && (
            <Badge size="sm" color="primary">
              {status}
            </Badge>
          )}
          <span className="text-xs text-text-secondary">
            {items.filter((d) => d.score !== null).length}/6 chiều
          </span>
          {hasPrevious && (
            <Button
              appearance="ghost"
              size="xs"
              onPress={onTogglePrevious}
              aria-pressed={showPrevious}
              className="min-h-9"
            >
              {showPrevious ? "Ẩn lần trước" : "Hiện lần trước"}
            </Button>
          )}
        </footer>
      </Card>
    </section>
  );
}
