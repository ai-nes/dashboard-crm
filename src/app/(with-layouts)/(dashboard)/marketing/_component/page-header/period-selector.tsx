"use client";

import { Button } from "@/components/tailgrids/core/button";
import { cn } from "@/utils/cn";
import { useMarketingTimeRange } from "../time-range-context";
import { PERIOD_OPTIONS } from "./data";

export default function PeriodSelector() {
  const { timeRange, setTimeRange } = useMarketingTimeRange();

  return (
    <div
      role="group"
      aria-label="Select time period"
      className="inline-flex items-center gap-1 rounded-full border border-card-border bg-card-background p-1"
    >
      {PERIOD_OPTIONS.map((option) => {
        const isActive = option.value === timeRange;

        return (
          <Button
            key={option.value}
            appearance={isActive ? "fill" : "ghost"}
            size="xs"
            onPress={() => setTimeRange(option.value)}
            className={cn(
              "rounded-full px-3.5",
              !isActive && "text-text-tertiary hover:text-text-primary",
            )}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
