"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { getWeeklyAiActivityData } from "@/services/api/ai";
import { cn } from "@/utils/cn";
import { ArrowDownIcon, ArrowUpIcon } from "@/utils/icon";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import WeeklyActivityTooltip from "./custom-tooltip";
import WeeklyAiActivitySkeleton from "./skeleton";
import { mapWeeklyAiActivityResponse } from "./utils";

export default function WeeklyAiActivity() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["weekly-ai-activity"],
    queryFn: getWeeklyAiActivityData,
  });

  const chartData = rawResponse ? mapWeeklyAiActivityResponse(rawResponse) : undefined;

  return (
    <Card>
      <CardHeader className="mb-6">
        <div>
          <CardTitle>Weekly AI Activity</CardTitle>
          {!isLoading && chartData ? (
            <p className="mt-1 flex items-center gap-1 text-sm leading-5 text-text-secondary">
              <span className="font-semibold text-text-primary">
                {chartData.summary.totalRequests.toLocaleString()}
              </span>
              requests
              <span
                className={cn(
                  "flex items-center gap-1 font-medium",
                  chartData.summary.requestsDeltaPercent >= 0 ? "text-green-600" : "text-red-600",
                )}
              >
                {chartData.summary.requestsDeltaPercent.toFixed(2)}%
                {chartData.summary.requestsDeltaPercent >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
              </span>
            </p>
          ) : null}
        </div>
      </CardHeader>

      {/* Chart */}
      <CardContent className="relative h-67.5 w-full p-0">
        {isLoading || !chartData ? (
          <WeeklyAiActivitySkeleton />
        ) : (
          <ChartContainer className="h-full w-full" height="100%" width="100%">
            <BarChart data={chartData.data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
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
                cursor={{ fill: "var(--color-border-primary)", opacity: 0.3 }}
                content={WeeklyActivityTooltip}
              />
              <Bar
                dataKey="requests"
                name="Requests"
                fill="#5750F1"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
