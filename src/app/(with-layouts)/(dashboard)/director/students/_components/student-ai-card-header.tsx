"use client";

import { RefreshCircle1Clockwise } from "@tailgrids/icons";
import type { ReactNode } from "react";
import { Badge } from "@/components/tailgrids/core/badge";
import { cn } from "@/utils/cn";

interface StudentAICardHeaderProps {
  description?: string;
  icon?: ReactNode;
  title: string;
  timestamp?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  rightAction?: React.ReactNode;
}

export default function StudentAICardHeader({
  description,
  icon,
  title,
  timestamp,
  isRefreshing = false,
  onRefresh,
  rightAction,
}: StudentAICardHeaderProps) {
  const refreshButton = onRefresh ? (
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
  ) : null;

  return (
    <header className="mb-6 flex items-start gap-3">
      {icon && (
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background-gray-secondary text-text-secondary"
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight text-text-primary">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-xs leading-5 text-text-tertiary">
                {description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {rightAction}
            {!timestamp && refreshButton}
            <Badge
              color="primary"
              prefixIcon={
                <span className="text-xs leading-none" aria-hidden="true">
                  ✦
                </span>
              }
              size="sm"
              className="inline-flex items-center gap-1 font-semibold tracking-wide"
            >
              AI
            </Badge>
          </div>
        </div>

        {timestamp && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-text-tertiary">
            <span>{timestamp}</span>
            {refreshButton}
          </div>
        )}
      </div>
    </header>
  );
}
