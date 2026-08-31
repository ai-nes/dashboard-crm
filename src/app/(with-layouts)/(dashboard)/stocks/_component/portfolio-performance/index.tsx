"use client";

import { Card, CardContent } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { getPortfolioPerformanceData } from "@/services/api/stocks";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import PortfolioPerformanceTooltip from "./custom-tooltip";
import { mapPortfolioPerformanceResponse } from "./data";
import HeaderSection from "./header";
import PortfolioPerformanceSkeleton from "./skeleton";
import type { PerformanceRange } from "./types";
import { getPortfolioPerformanceStats } from "./utils";

export default function PortfolioPerformance() {
  const [timeRange, setTimeRange] = useState<PerformanceRange>("1M");

  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["portfolio-performance", timeRange],
    queryFn: () => getPortfolioPerformanceData(timeRange),
  });

  const chartData = rawResponse ? mapPortfolioPerformanceResponse(rawResponse) : undefined;
  const stats = chartData ? getPortfolioPerformanceStats(chartData.summary) : [];

  return (
    <Card>
      <HeaderSection
        isLoading={isLoading}
        chartData={chartData}
        stats={stats}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
      />

      {/* Chart */}
      <CardContent className="relative h-67.5 w-full p-0">
        {isLoading || !chartData ? (
          <PortfolioPerformanceSkeleton />
        ) : (
          <ChartContainer className="h-full w-full" height="100%" width="100%">
            <AreaChart data={chartData.data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <defs>
                <linearGradient id="portfolio-background" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={"5%"} stopColor="#F37021" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F37021" stopOpacity={0} />
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
                content={PortfolioPerformanceTooltip}
              />
              <Area
                type="monotone"
                dataKey="portfolio"
                name="Portfolio"
                stroke="#F37021"
                strokeWidth={2}
                fill="url(#portfolio-background)"
                dot={false}
                activeDot={{ r: 4, fill: "#F37021", stroke: "#fff", strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="benchmark"
                name="Benchmark"
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
