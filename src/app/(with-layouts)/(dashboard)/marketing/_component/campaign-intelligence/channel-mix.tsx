"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/tailgrids/core/chart";
import type { CampaignRecord } from "@/services/api/campaign-intelligence";
import { Cell, Pie, PieChart } from "recharts";
import { formatCompactCurrency } from "./formatters";
import { PlatformIcon } from "./icons";

const CHART_COLORS = [
  "#2563eb", // Primary Blue (School Event)
  "#10b981", // Emerald (Facebook)
  "#f59e0b", // Amber (Google)
  "#06b6d4", // Cyan (TikTok)
  "#ec4899", // Pink (Zalo)
];

export function ChannelMix({ campaigns }: { campaigns: CampaignRecord[] }) {
  const totalRevenue = campaigns.reduce((sum, campaign) => sum + campaign.confirmedRevenue, 0);
  const data = campaigns.map((campaign, index) => ({
    ...campaign,
    fill: CHART_COLORS[index % CHART_COLORS.length],
    percentage: totalRevenue > 0 ? (campaign.confirmedRevenue / totalRevenue) * 100 : 0,
  }));

  return (
    <Card className="flex h-full min-w-0 flex-col p-0">
      <CardHeader className="flex flex-row items-center justify-between border-b border-card-border px-5 py-4">
        <div>
          <CardTitle>Cơ cấu doanh thu theo kênh</CardTitle>
          <p className="mt-0.5 text-xs text-text-tertiary">Tỷ trọng doanh thu xác nhận thực tế</p>
        </div>
        <span className="text-xs font-semibold tabular-nums text-text-primary">
          Tổng: {formatCompactCurrency(totalRevenue)}
        </span>
      </CardHeader>

      {/* Donut Chart Section */}
      <div className="relative min-h-[210px] flex-1 p-4">
        <ChartContainer className="size-full" height="100%" width="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => (
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-text-secondary">{name}:</span>
                      <span className="font-semibold tabular-nums text-text-primary">
                        {formatCompactCurrency(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={data}
              dataKey="confirmedRevenue"
              nameKey="channel"
              innerRadius="58%"
              outerRadius="84%"
              paddingAngle={3}
              stroke="var(--card-background)"
              strokeWidth={3}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.id}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Centered Total */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-text-tertiary">Doanh thu</span>
          <span className="text-xl font-bold tracking-tight tabular-nums text-text-primary">
            {formatCompactCurrency(totalRevenue)}
          </span>
        </div>
      </div>

      {/* Channels Breakdown List */}
      <div className="space-y-2.5 border-t border-card-border p-5">
        {data.map((campaign) => (
          <div key={campaign.id} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex min-w-0 items-center gap-2.5">
              {/* Distinct Color Dot for 1-to-1 mapping with Donut slice */}
              <span
                className="size-2.5 shrink-0 rounded-full ring-1 ring-card-border"
                style={{ backgroundColor: campaign.fill }}
                aria-hidden="true"
              />
              <PlatformIcon channel={campaign.channel} size="sm" />
              <span className="truncate font-medium text-text-primary">
                {campaign.channel}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <span className="font-medium tabular-nums text-text-tertiary">
                {formatCompactCurrency(campaign.confirmedRevenue)}
              </span>
              <span className="w-10 text-right font-semibold tabular-nums text-text-primary">
                {campaign.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}



