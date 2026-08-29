"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/tailgrids/core/chart";
import type { CampaignIntelligenceResponse } from "@/services/api/campaign-intelligence";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { formatCompactCurrency } from "./formatters";

export function PerformanceTrend({ trend }: Pick<CampaignIntelligenceResponse, "trend">) {
  return (
    <Card className="flex h-full flex-col p-0">
      <CardHeader className="flex flex-col gap-2 border-b border-card-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Chi phí và doanh thu xác nhận</CardTitle>
          <p className="mt-0.5 text-xs text-text-tertiary">Theo dõi hiệu quả đã được CRM đối soát</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-text-secondary">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary-500" />
            <span>Doanh thu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 rounded-full border-t-2 border-dashed border-text-300" />
            <span>Chi phí</span>
          </div>
        </div>
      </CardHeader>

      <div className="flex-1 p-4">
        <div className="h-68 w-full">
          <ChartContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 20, right: 16, left: 4, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="var(--border-color-base-100)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-chart-tick)", fontSize: 12 }}
                dy={6}
              />
              <YAxis
                tickFormatter={formatCompactCurrency}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-chart-tick)", fontSize: 12 }}
                width={70}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value, name) => (
                      <p className="flex items-center justify-between gap-4 text-xs">
                        <span className="text-text-secondary">
                          {name === "spend" ? "Chi phí" : "Doanh thu"}:
                        </span>
                        <span className="font-semibold tabular-nums text-text-primary">
                          {formatCompactCurrency(Number(value))}
                        </span>
                      </p>
                    )}
                  />
                }
              />
              <Line
                dataKey="confirmedRevenue"
                name="confirmedRevenue"
                stroke="var(--primary-500)"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: "var(--primary-500)", strokeWidth: 1, stroke: "var(--card-background)" }}
                activeDot={{ r: 5.5, fill: "var(--primary-500)" }}
              />
              <Line
                dataKey="spend"
                name="spend"
                stroke="var(--text-300)"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={{ r: 3, fill: "var(--text-300)" }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </div>
    </Card>
  );
}

