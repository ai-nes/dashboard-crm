"use client";

import { Card, CardContent } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { getLeadGrowthData } from "@/services/api/crm";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import LeadGrowthTooltip from "./custom-tooltip";
import HeaderSection from "./header";
import LeadGrowthChartSkeleton from "./skeleton";
import type { LeadGrowthGranularity } from "@/services/api/crm";
import { getLeadGrowthStats, mapLeadGrowthResponse } from "./utils";

export default function LeadGrowthChart() {
  const [granularity, setGranularity] = useState<LeadGrowthGranularity>("7d");

  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["crm-lead-growth", granularity],
    queryFn: () => getLeadGrowthData(granularity),
  });

  const chartData = rawResponse ? mapLeadGrowthResponse(rawResponse) : undefined;
  const stats = chartData ? getLeadGrowthStats(chartData.summary) : [];

  return (
    <Card>
      <HeaderSection
        isLoading={isLoading}
        chartData={chartData}
        stats={stats}
        granularity={granularity}
        setGranularity={setGranularity}
      />

      <CardContent className="relative h-67.5 w-full p-0">
        {isLoading || !chartData ? (
          <LeadGrowthChartSkeleton />
        ) : (
          <ChartContainer className="h-full w-full" height="100%" width="100%">
            <AreaChart data={chartData.data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <defs>
                <linearGradient id="crm-lead-growth-bg" x1="0" y1="0" x2="0" y2="1">
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
                content={LeadGrowthTooltip}
              />
              <Area
                type="monotone"
                dataKey="leads"
                name="Leads"
                stroke="#F37021"
                strokeWidth={2}
                fill="url(#crm-lead-growth-bg)"
                dot={false}
                activeDot={{ r: 4, fill: "#F37021", stroke: "#fff", strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="conversions"
                name="Conversions"
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
