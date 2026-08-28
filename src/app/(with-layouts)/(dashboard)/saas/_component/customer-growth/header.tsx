import { CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { cn } from "@/utils/cn";
import { ArrowDownIcon, ArrowUpIcon } from "@/utils/icon";
import { CustomerGrowthStatSkeleton } from "./skeleton";
import type { CustomerGrowthViewModel } from "./types";

type HeaderSectionProps = {
  isLoading: boolean;
  chartData?: CustomerGrowthViewModel;
  stats: Array<{
    id: string;
    label: string;
    value: string;
    delta: string;
    isPositive: boolean;
    dotClassName: string;
  }>;
};

export default function HeaderSection({ isLoading, stats, chartData }: HeaderSectionProps) {
  return (
    <CardHeader className="mb-6 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
      <CardTitle className="sr-only">Customer Growth</CardTitle>

      <div className="flex flex-col gap-8 sm:flex-row">
        {isLoading || !chartData ? (
          <>
            <CustomerGrowthStatSkeleton />
            <CustomerGrowthStatSkeleton />
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
                  <span>last period</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </CardHeader>
  );
}
