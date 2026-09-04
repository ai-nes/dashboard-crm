"use client";

import { ChevronDown, ChevronRight } from "@tailgrids/icons";
import { useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

interface StudentActivityCardProps {
  icon?: ReactNode;
  iconClassName?: string;
  title: ReactNode;
  timestamp: string;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  preview?: ReactNode;
  children: ReactNode;
}

export default function StudentActivityCard({
  icon,
  iconClassName,
  title,
  timestamp,
  defaultExpanded = true,
  expanded: expandedProp,
  onExpandedChange,
  preview,
  children,
}: StudentActivityCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = expandedProp ?? internalExpanded;

  const toggleExpanded = () => {
    const nextExpanded = !expanded;
    if (expandedProp === undefined) setInternalExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  };

  return (
    <article className="overflow-hidden rounded-xl border border-card-border bg-card-background shadow-sm">
      <button
        type="button"
        onClick={toggleExpanded}
        className="flex w-full items-center justify-between gap-3 bg-background-gray-secondary/30 px-4 py-4 text-left sm:px-5"
        aria-expanded={expanded}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-text-tertiary" aria-hidden="true">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
          {icon ? (
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full",
                iconClassName,
              )}
              aria-hidden="true"
            >
              {icon}
            </span>
          ) : null}
          <span className="min-w-0 truncate text-base text-text-primary">{title}</span>
        </span>
        <span className="shrink-0 text-sm text-text-tertiary">{timestamp}</span>
      </button>
      {!expanded && (
        <div className="border-t border-card-border px-4 py-4 sm:px-5">
          {preview ?? children}
        </div>
      )}
      {expanded && (
        <div className="border-t border-card-border px-4 py-4 sm:px-5">{children}</div>
      )}
    </article>
  );
}
