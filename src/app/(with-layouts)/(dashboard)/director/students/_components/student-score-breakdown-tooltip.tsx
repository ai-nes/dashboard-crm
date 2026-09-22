"use client";

import type { ReactNode } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tailgrids/core/tooltip";
import { cn } from "@/utils/cn";

import type { StudentScoreBreakdown } from "./student-score-breakdown";

interface StudentScoreBreakdownTooltipProps {
  breakdown: StudentScoreBreakdown | null | undefined;
  children: ReactNode;
  className?: string;
}

const numberFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
});

function formatPercentage(value: number | null): string {
  return value === null ? "—" : `${numberFormatter.format(value)}%`;
}

export default function StudentScoreBreakdownTooltip({
  breakdown,
  children,
  className,
}: StudentScoreBreakdownTooltipProps) {
  return (
    <Tooltip placement="left">
      <TooltipTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          aria-label="Xem chi tiết điểm tiềm năng"
          className={cn(
            "cursor-help rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-button-primary-focus-ring",
            className,
          )}
        >
          {children}
        </div>
      </TooltipTrigger>

      <TooltipContent className="w-72 max-w-[calc(100vw-2rem)] p-3">
        {breakdown ? (
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-tooltip-text-color">
                Chi tiết điểm
              </p>
              <p className="text-sm font-bold tabular-nums text-primary-500">
                {formatPercentage(breakdown.overallScore)}
              </p>
            </div>

            <div className="mt-2.5 space-y-2">
              {breakdown.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-card-border/70 bg-card-background/60 px-3 py-2.5"
                  aria-label={`${item.label}: điểm ${formatPercentage(item.score)}, trọng số ${formatPercentage(item.weight)}`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-tooltip-text-color">
                        {item.label}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-tooltip-text-color/70">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right tabular-nums">
                    <p className="text-xs font-semibold text-tooltip-text-color">
                      {formatPercentage(item.score)}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-tooltip-text-color/70">
                      {formatPercentage(item.weight)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-2 text-[10px] leading-4 text-tooltip-text-color/70">
              Mỗi dòng gồm điểm thành phần ở trên và trọng số áp dụng ở dưới.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold text-tooltip-text-color">
              Chi tiết điểm
            </p>
            <p className="mt-1 text-[11px] leading-4 text-tooltip-text-color/70">
              Chưa có dữ liệu điểm thành phần từ lần chấm gần nhất.
            </p>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
