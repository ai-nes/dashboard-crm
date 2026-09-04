"use client";

import { Diamonds1, RefreshCircle1Clockwise } from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { cn } from "@/utils/cn";

interface StudentAICardHeaderProps {
  title: string;
  timestamp?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  rightAction?: React.ReactNode;
}

export default function StudentAICardHeader({
  title,
  timestamp,
  isRefreshing = false,
  onRefresh,
  rightAction,
}: StudentAICardHeaderProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight text-text-primary">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {rightAction}
          <Badge
            color="primary"
            size="sm"
            className="inline-flex items-center gap-1 font-semibold tracking-wide"
          >
            <Diamonds1 size={12} aria-hidden="true" />
            AI
          </Badge>
        </div>
      </div>

      {timestamp && (
        <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
          <span>{timestamp}</span>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Làm mới phân tích"
              className={cn(
                "inline-flex cursor-pointer rounded-sm p-0.5 text-text-tertiary transition-colors hover:text-text-primary focus:outline-hidden",
                isRefreshing && "animate-spin text-primary-500",
              )}
            >
              <RefreshCircle1Clockwise size={13} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
