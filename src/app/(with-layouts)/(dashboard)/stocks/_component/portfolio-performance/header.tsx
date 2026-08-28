import { CardHeader } from "@/components/tailgrids/core/card";
import { cn } from "@/utils/cn";
import { ArrowDownIcon, ArrowUpIcon } from "@/utils/icon";
import { PortfolioPerformanceStatSkeleton } from "./skeleton";
import type { PerformanceRange, PortfolioPerformanceViewModel } from "./types";

const RANGE_OPTIONS: PerformanceRange[] = ["1W", "1M", "3M", "1Y", "All"];

type HeaderSectionProps = {
  isLoading: boolean;
  chartData?: PortfolioPerformanceViewModel;
  stats: Array<{
    id: string;
    label: string;
    value: string;
    delta: string;
    isPositive: boolean;
    dotClassName: string;
  }>;
  timeRange: PerformanceRange;
  setTimeRange: (value: PerformanceRange) => void;
};

export default function HeaderSection({
  isLoading,
  stats,
  chartData,
  timeRange,
  setTimeRange,
}: HeaderSectionProps) {
  return (
    <CardHeader className="mb-6 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
      <div className="flex flex-col gap-8 sm:flex-row">
        {isLoading || !chartData ? (
          <>
            <PortfolioPerformanceStatSkeleton />
            <PortfolioPerformanceStatSkeleton />
          </>
        ) : (
          stats.map((stat) => (
            <div key={stat.id}>
              <div className="mb-2 flex items-center gap-3">
                <span className={cn("size-2 rounded-xs", stat.dotClassName)} />
                <span className="text-sm leading-5 font-medium text-text-secondary">
                  {stat.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-text-primary md:text-2xl md:leading-8">
                  {stat.value}
                </h3>
                <p className="flex items-center gap-1 text-sm leading-5 text-text-secondary">
                  <span
                    className={cn(
                      "font-medium",
                      stat.isPositive ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {stat.delta}
                  </span>
                  <span
                    className={cn("size-4", stat.isPositive ? "text-green-600" : "text-red-600")}
                  >
                    {stat.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  </span>
                  <span>this period</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Range toggle */}
      <div
        role="tablist"
        aria-label="Select time range"
        className="flex items-center gap-1 rounded-lg bg-background-gray-secondary p-1"
      >
        {RANGE_OPTIONS.map((range) => (
          <button
            key={range}
            type="button"
            role="tab"
            aria-selected={timeRange === range}
            onClick={() => setTimeRange(range)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition",
              timeRange === range
                ? "bg-tab-active-background text-text-primary shadow-xs"
                : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            {range}
          </button>
        ))}
      </div>
    </CardHeader>
  );
}
