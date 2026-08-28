"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { getCampaignVisitorsData } from "@/services/api/marketing";
import { cn } from "@/utils/cn";
import { ArrowDownIcon, ArrowUpIcon } from "@/utils/icon";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { useMarketingTimeRange } from "../time-range-context";
import CampaignVisitorsTooltip from "./custom-tooltip";
import CampaignVisitorsSkeleton from "./skeleton";
import { mapCampaignVisitorsResponse } from "./utils";

const SERIES = [
  { key: "social", name: "Social", stroke: "#5750F1", dotClassName: "bg-brand-500" },
  { key: "search", name: "Search", stroke: "#0FADCF", dotClassName: "bg-[#0FADCF]" },
  { key: "email", name: "Email", stroke: "#F97316", dotClassName: "bg-[#F97316]" },
  { key: "referral", name: "Referral", stroke: "#D8B4FE", dotClassName: "bg-purple-500" },
] as const;

export default function CampaignVisitors() {
  const { timeRange } = useMarketingTimeRange();

  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["campaign-visitors", timeRange],
    queryFn: () => getCampaignVisitorsData(timeRange),
  });

  const chartData = rawResponse ? mapCampaignVisitorsResponse(rawResponse) : undefined;

  return (
    <Card>
      <CardHeader className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <CardTitle>Campaign Visitors</CardTitle>
          {chartData ? (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xl font-semibold text-text-primary md:text-2xl">
                {chartData.summary.totalVisitors.toLocaleString()}
              </span>
              <span
                className={cn(
                  "flex items-center gap-1 text-sm leading-5 font-medium",
                  chartData.summary.deltaPercent >= 0 ? "text-green-600" : "text-red-600",
                )}
              >
                {chartData.summary.deltaPercent.toFixed(2)}%
                {chartData.summary.deltaPercent >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {SERIES.map((series) => (
            <div key={series.key} className="flex items-center gap-2">
              <span className={cn("size-2 rounded-xs", series.dotClassName)} />
              <span className="text-sm leading-5 font-medium text-text-secondary">
                {series.name}
              </span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="relative h-67.5 w-full p-0">
        {isLoading || !chartData ? (
          <CampaignVisitorsSkeleton />
        ) : (
          <ChartContainer className="h-full w-full" height="100%" width="100%">
            <AreaChart data={chartData.data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <defs>
                {SERIES.map((series) => (
                  <linearGradient
                    key={series.key}
                    id={`campaign-visitors-${series.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={series.stroke} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={series.stroke} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-text-tertiary)", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-text-tertiary)", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ stroke: "#A1A1AA", strokeWidth: 1, strokeDasharray: "4 4" }}
                content={CampaignVisitorsTooltip}
              />
              {SERIES.map((series) => (
                <Area
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.name}
                  stroke={series.stroke}
                  strokeWidth={2}
                  fill={`url(#campaign-visitors-${series.key})`}
                  dot={false}
                  activeDot={{ r: 4, fill: series.stroke, stroke: "#fff", strokeWidth: 2 }}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
