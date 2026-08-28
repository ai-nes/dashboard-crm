"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { getPlanMixData } from "@/services/api/saas";
import { useQuery } from "@tanstack/react-query";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { TooltipContentProps } from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import PlanMixLegend from "./legend";
import PlanMixSkeleton from "./skeleton";
import { mapPlanMixResponse } from "./utils";

function PlanMixTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="rounded-lg border border-card-border bg-dropdowns-background p-3 shadow-lg">
        <div className="flex items-center gap-2.5 text-sm">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="font-medium text-text-tertiary">{entry.name}</span>
          <span className="font-semibold text-text-primary">{entry.value}%</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function PlanMix() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["saas-plan-mix"],
    queryFn: getPlanMixData,
  });

  const planMix = rawResponse ? mapPlanMixResponse(rawResponse) : undefined;

  return (
    <Card>
      <CardHeader className="mb-6">
        <CardTitle>Plan Mix</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading || !planMix ? (
          <PlanMixSkeleton />
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative flex size-40 shrink-0 items-center justify-center">
              <ChartContainer className="size-40" height={160} width={160}>
                <PieChart>
                  <Pie
                    data={planMix.slices}
                    dataKey="percentage"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {planMix.slices.map((slice) => (
                      <Cell key={slice.id} fill={slice.color} />
                    ))}
                  </Pie>
                  <Tooltip content={PlanMixTooltip} />
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute flex flex-col items-center">
                <span className="text-lg font-semibold text-text-primary">
                  {planMix.totalSubscribers.toLocaleString("en-US")}
                </span>
                <span className="text-xs text-text-tertiary">Subscribers</span>
              </div>
            </div>

            <div className="w-full">
              <PlanMixLegend slices={planMix.slices} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
