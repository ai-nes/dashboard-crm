"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Badge } from "@/components/tailgrids/core/badge";
import { cn } from "@/utils/cn";

import type { PipelineLead } from "./types";

const riskDotClasses = {
  critical: "bg-error-500",
  attention: "bg-warning-500",
  healthy: "bg-success-500",
  neutral: "bg-text-tertiary/50",
};

const riskBadgeColors = {
  critical: "error",
  attention: "warning",
  healthy: "success",
  neutral: "gray",
} as const;

interface PipelineCardProps {
  lead: PipelineLead;
  isSelected: boolean;
  onSelect: (lead: PipelineLead) => void;
}

export default function PipelineCard({ lead, isSelected, onSelect }: PipelineCardProps) {
  return (
    <Button
      appearance="outline"
      className={cn(
        "h-auto w-full items-start justify-start rounded-lg border-card-border bg-card-background p-3 text-left shadow-none transition-[transform,border-color,background-color,box-shadow] duration-200 motion-reduce:transition-none hover:-translate-y-px hover:bg-background-soft-50 hover:shadow-sm",
        isSelected && "border-primary-500 bg-badge-primary-background shadow-sm",
      )}
      onPress={() => onSelect(lead)}
      aria-pressed={isSelected}
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="truncate text-sm font-semibold text-text-primary">{lead.name}</span>
          <span className={cn("mt-1 size-2 shrink-0 rounded-full", riskDotClasses[lead.risk])} aria-label={lead.riskLabel ?? "Ổn định"} />
        </span>
        <span className="mt-1 block truncate text-xs text-text-secondary">{lead.school} · {lead.region}</span>
        {lead.riskLabel && <span className="mt-2 block"><Badge color={riskBadgeColors[lead.risk]} size="sm">{lead.riskLabel}</Badge></span>}
        <span className="mt-3 block border-t border-card-border pt-2 text-xs text-text-secondary">
          <span className="block truncate font-medium text-text-primary">{lead.nextAction}</span>
          <span className="mt-1 block">{lead.lastInteraction}</span>
        </span>
      </span>
    </Button>
  );
}
