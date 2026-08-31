"use client";

import { Card, CardContent } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { getRevenueOverviewData } from "@/services/api/saas";
import type { Granularity } from "@/services/api/saas";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import RevenueOverviewTooltip from "./custom-tooltip";
import HeaderSection from "./header";
import RevenueOverviewSkeleton from "./skeleton";
import { getRevenueOverviewStats, mapRevenueOverviewResponse } from "./utils";

interface RevenueOverviewProps {
  granularity: Granularity;
}

export default function RevenueOverview({ granularity }: RevenueOverviewProps) {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["saas-revenue-overview", granularity],
    queryFn: () => getRevenueOverviewData(granularity),
  });

  const chartData = rawResponse ? mapRevenueOverviewResponse(rawResponse) : undefined;
  const stats = chartData ? getRevenueOverviewStats(chartData.summary) : [];

  return (
    <Card>
      <HeaderSection isLoading={isLoading} chartData={chartData} stats={stats} />

      <CardContent className="relative h-67.5 w-full p-0">
        {isLoading || !chartData ? (
          <RevenueOverviewSkeleton />
        ) : (
          <ChartContainer className="h-full w-full" height="100%" width="100%">
            <AreaChart data={chartData.data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <defs>
                <linearGradient id="saas-revenue-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F37021" stopOpacity={0.2} />
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
                content={RevenueOverviewTooltip}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#F37021"
                strokeWidth={2}
                fill="url(#saas-revenue-fill)"
                dot={false}
                activeDot={{ r: 4, fill: "#F37021", stroke: "#fff", strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="mrr"
                name="MRR"
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
