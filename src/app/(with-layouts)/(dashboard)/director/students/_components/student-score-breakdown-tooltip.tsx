"use client";

import type { ReactNode } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tailgrids/core/tooltip";
import { cn } from "@/utils/cn";

import type { StudentScoreBreakdown } from "./student-score-breakdown";
import StudentScoreBreakdownContent from "./student-score-breakdown-content";

interface StudentScoreBreakdownTooltipProps {
  breakdown: StudentScoreBreakdown | null | undefined;
  children: ReactNode;
  className?: string;
}

export default function StudentScoreBreakdownTooltip({
  breakdown,
  children,
  className,
}: StudentScoreBreakdownTooltipProps) {
  return (
    <Tooltip placement="left-start">
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

      <TooltipContent className="z-[100] w-96 max-w-[calc(100vw-2rem)] p-3">
        <div className="max-h-[calc(50dvh-6rem)] overflow-y-auto p-1 lg:max-h-[calc(100dvh-10rem)]">
          {breakdown ? (
            <StudentScoreBreakdownContent breakdown={breakdown} />
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
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
