"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/tailgrids/core/card";
import { getMarketingOverviewStats } from "@/services/api/marketing";
import { cn } from "@/utils/cn";
import { ArrowDownIcon, ArrowUpIcon } from "@/utils/icon";
import { useQuery } from "@tanstack/react-query";
import { useMarketingTimeRange } from "../time-range-context";
import TotalImpressionSkeleton from "./skeleton";
import { mapMarketingOverviewStats } from "./utils";

export default function TotalImpression() {
  const { timeRange } = useMarketingTimeRange();

  const { data, isLoading } = useQuery({
    queryKey: ["marketing-overview-stats", timeRange],
    queryFn: () => getMarketingOverviewStats(timeRange),
  });

  const stats = data ? mapMarketingOverviewStats(data) : [];

  if (isLoading) {
    return <TotalImpressionSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((item) => (
        <Card key={item.id}>
          {/* Icon */}
          <CardHeader>
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-lg",
                item.iconBgClass,
                item.iconColorClass,
              )}
            >
              {item.icon}
            </div>
          </CardHeader>

          {/* Value */}
          <CardContent className="mt-6 p-0">
            <div className="mb-1.25 text-xl leading-7 font-semibold text-text-primary md:text-2xl md:leading-8">
              {item.value}
            </div>
          </CardContent>

          {/* Label and Percentage */}
          <CardFooter className="flex items-center justify-between p-0">
            <span className="text-sm leading-5 font-medium text-text-tertiary">{item.title}</span>
            <div
              className={cn(
                "flex items-center gap-1 text-sm leading-5 font-medium",
                item.isPositive ? "text-green-600" : "text-red-600",
              )}
            >
              {item.change}
              {item.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
