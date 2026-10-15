"use client";
import { useId } from "react";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { analysisDimensionIcons } from "./student-analysis-icons";
import StudentAnalysisEvidence from "./student-analysis-evidence";
import type { AnalysisDimensionView } from "./student-analysis-view";

interface Props {
  items: AnalysisDimensionView[];
  previous?: AnalysisDimensionView[];
  selectedCode: string;
  onSelect: (code: string) => void;
  isLoading: boolean;
}
export default function StudentAnalysisExplorer({
  items,
  previous,
  selectedCode,
  onSelect,
  isLoading,
}: Props) {
  const heading = useId();
  const item = items.find((d) => d.code === selectedCode) ?? items[0];
  return (
    <Card
      className="flex h-[640px] min-w-0 flex-col overflow-hidden p-0 @3xl:h-[560px]"
      aria-labelledby={heading}
      aria-busy={isLoading}
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-card-border p-3">
        <div>
          <h2
            id={heading}
            className="text-base font-semibold text-text-primary"
          >
            Phân tích 6 chiều
          </h2>
        </div>
      </header>
      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] @3xl:grid-cols-[208px_minmax(0,1fr)] @3xl:grid-rows-1">
        <div
          className="grid max-h-60 min-h-0 min-w-0 auto-rows-min grid-cols-2 content-start gap-1 overflow-y-auto border-b border-card-border bg-background-gray-secondary p-2 @3xl:max-h-none @3xl:grid-cols-1 @3xl:border-r @3xl:border-b-0"
          aria-label="Chọn chiều phân tích"
        >
          {items.map((d) => {
            const Icon = analysisDimensionIcons[d.code];
            return (
              <Button
                key={d.code}
                appearance="ghost"
                size="sm"
                onPress={() => onSelect(d.code)}
                aria-pressed={d.code === selectedCode}
                aria-label={`Xem dẫn chứng ${d.label}`}
                className={`min-h-14 w-full items-start justify-start gap-2 px-3 py-2 text-left ${d.code === selectedCode ? "bg-card-background ring-1 ring-card-border" : "hover:bg-item-hover"}`}
              >
                <Icon
                  size={18}
                  aria-hidden="true"
                  className={
                    d.code === selectedCode
                      ? "mt-1 shrink-0 text-primary-700"
                      : "mt-1 shrink-0 text-text-secondary"
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {d.label}
                  </p>

                  {d.score !== null && (
                    <div
                      className="mt-2 h-0.5 overflow-hidden rounded-full bg-card-border"
                      aria-hidden="true"
                    >
                      <div
                        className={
                          d.code === selectedCode
                            ? "h-full bg-primary-700"
                            : "h-full bg-text-secondary"
                        }
                        style={{ width: `${d.score}%` }}
                      />
                    </div>
                  )}
                </div>
                <span className="text-base font-semibold tabular-nums text-text-primary">
                  {d.score ?? "—"}
                </span>
              </Button>
            );
          })}
        </div>
        <div
          key={item.code}
          className="min-h-0 min-w-0 overflow-y-auto overscroll-contain"
          role="region"
          aria-label="Chi tiết chiều phân tích"
          tabIndex={0}
        >
          {isLoading && !item.dimension ? (
            <div className="space-y-4 p-5">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <StudentAnalysisEvidence
              item={item}
              previous={previous?.find((d) => d.code === item.code)}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
