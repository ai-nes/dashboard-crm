"use client";

import { Card, CardContent } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { getCustomerGrowthData } from "@/services/api/saas";
import type { Granularity } from "@/services/api/saas";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import CustomerGrowthTooltip from "./custom-tooltip";
import HeaderSection from "./header";
import CustomerGrowthSkeleton from "./skeleton";
import { getCustomerGrowthStats, mapCustomerGrowthResponse } from "./utils";

interface CustomerGrowthProps {
  granularity: Granularity;
}

export default function CustomerGrowth({ granularity }: CustomerGrowthProps) {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["saas-customer-growth", granularity],
    queryFn: () => getCustomerGrowthData(granularity),
  });

  const chartData = rawResponse ? mapCustomerGrowthResponse(rawResponse) : undefined;
  const stats = chartData ? getCustomerGrowthStats(chartData.summary) : [];

  return (
    <Card>
      <HeaderSection isLoading={isLoading} chartData={chartData} stats={stats} />

      <CardContent className="relative h-67.5 w-full p-0">
        {isLoading || !chartData ? (
          <CustomerGrowthSkeleton />
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
                cursor={{ fill: "var(--color-background-gray-secondary_alt)" }}
                content={CustomerGrowthTooltip}
              />
              <Bar dataKey="newSubscribers" name="New Subscribers" fill="#F37021" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="churnedSubscribers"
                name="Churned Subscribers"
                fill="#D8B4FE"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
