"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer, ChartTooltip } from "@/components/tailgrids/core/chart";
import { getAiProviderDistributionData } from "@/services/api/ai";
import { useQuery } from "@tanstack/react-query";
import { Label, Pie, PieChart, PieSectorShapeProps, Sector } from "recharts";

import AiProviderDistributionSkeleton from "./skeleton";
import ProviderDistributionTooltip from "./tooltip";
import { mapProviderDistributionResponse } from "./utils";

function CustomPieCell(props: PieSectorShapeProps) {
  const payload = props.payload as { name: string; value: number; color: string } | undefined;
  return <Sector {...props} fill={payload?.color ?? "var(--color-brand-500)"} cornerRadius={2} />;
}

export default function AiProviderDistribution() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["ai-provider-distribution"],
    queryFn: getAiProviderDistributionData,
  });

  const distribution = rawResponse ? mapProviderDistributionResponse(rawResponse) : undefined;

  return (
    <Card>
      <CardHeader className="mb-6">
        <CardTitle>AI Provider Distribution</CardTitle>
      </CardHeader>

      {isLoading || !distribution ? (
        <AiProviderDistributionSkeleton />
      ) : (
        <div className="flex h-75 flex-col items-center justify-between">
          <div className="relative flex w-full flex-1 items-center justify-center">
            <ChartContainer
              className="h-full w-full"
              height={210}
              width="100%"
              aspect={undefined}
            >
              <PieChart>
                <ChartTooltip
                  cursor={{ fill: "transparent" }}
                  content={ProviderDistributionTooltip}
                />
                <Pie
                  data={distribution.segments}
                  cx="50%"
                  cy="50%"
                  innerRadius={82}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                  shape={CustomPieCell}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="central"
                          >
                            <tspan
                              x={viewBox.cx}
                              dy="-0.3em"
                              className="fill-text-primary text-[20px] font-semibold tracking-[-0.2px]"
                            >
                              {distribution.totalRequests.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              dy="1.4em"
                              className="fill-text-tertiary text-sm font-normal tracking-[-0.15px]"
                            >
                              Requests
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          {/* Legend */}
          <div className="flex w-full flex-wrap justify-center gap-x-5 gap-y-2 pt-4">
            {distribution.segments.map((segment) => (
              <div key={segment.id} className="flex items-center gap-1.5">
                <span className="size-2 rounded-xs" style={{ backgroundColor: segment.color }} />
                <span className="text-sm font-medium text-text-secondary">
                  {segment.name} <span className="text-text-tertiary">{segment.value}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
