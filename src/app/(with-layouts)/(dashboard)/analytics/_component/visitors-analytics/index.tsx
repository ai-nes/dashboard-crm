"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { getVisitorsAnalyticsData } from "@/services/api/analytics";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import VisitorsAnalyticsTooltip from "./custom-tooltip";
import { mapVisitorsAnalyticsResponse } from "./data";
import HeaderSection from "./header";
import VisitorsAnalyticsSkeleton from "./skeleton";
import type { AnalyticsGranularity } from "@/services/api/analytics";
import { getVisitorsAnalyticsStats } from "./utils";

export default function VisitorsAnalytics() {
  const [timeRange, setTimeRange] = useState<AnalyticsGranularity>("monthly");

  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["visitors-analytics", timeRange],
    queryFn: () => getVisitorsAnalyticsData(timeRange),
  });

  const chartData = rawResponse ? mapVisitorsAnalyticsResponse(rawResponse) : undefined;
  const stats = chartData ? getVisitorsAnalyticsStats(chartData.summary) : [];

  return (
    <Card>
      <CardHeader className="mb-2">
        <CardTitle>Visitors Analytics</CardTitle>
      </CardHeader>

      <HeaderSection
        isLoading={isLoading}
        chartData={chartData}
        stats={stats}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
      />

      {/* Chart */}
      <CardContent className="relative h-75 w-full p-0">
        {isLoading || !chartData ? (
          <VisitorsAnalyticsSkeleton />
        ) : (
          <ChartContainer className="h-full w-full" height="100%" width="100%">
            <AreaChart data={chartData.data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <defs>
                <linearGradient id="visitors-background" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={"5%"} stopColor="#3758F9" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3758F9" stopOpacity={0} />
                </linearGradient>
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
                content={VisitorsAnalyticsTooltip}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                name="Visitors"
                stroke="#5750F1"
                strokeWidth={2}
                fill="url(#visitors-background)"
                dot={false}
                activeDot={{ r: 4, fill: "#5750F1", stroke: "#fff", strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="uniqueVisitors"
                name="Unique Visitors"
                stroke="#D8B4FE"
                strokeWidth={2}
                fill="transparent"
                dot={false}
                activeDot={{ r: 4, fill: "#D8B4FE", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
