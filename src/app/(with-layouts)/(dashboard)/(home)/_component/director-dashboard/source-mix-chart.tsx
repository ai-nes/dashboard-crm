"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { ArrowRight } from "@tailgrids/icons";
import Link from "next/link";
import { Cell, Pie, PieChart, Tooltip } from "recharts";

import DirectorChartTooltip from "./chart-tooltip";
import { sourcePerformance } from "./data";

export default function SourceMixChart() {
  return (
    <Card className="flex h-full min-w-0 flex-col bg-background-gray-primary">
      <CardHeader className="mb-2 items-start">
        <div>
          <CardTitle>Cơ cấu nguồn hồ sơ</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Tỷ trọng đóng góp vào tổng hồ sơ mới</p>
        </div>
        <Link
          href="/director/marketing/attribution"
          className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600"
        >
          Chi tiết
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </CardHeader>

      <div className="relative min-h-60 flex-1">
        <ChartContainer className="h-full w-full" height="100%" width="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <Tooltip content={<DirectorChartTooltip valueSuffix="%" />} />
            <Pie
              data={sourcePerformance}
              dataKey="share"
              nameKey="label"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={3}
              stroke="var(--card-background)"
              strokeWidth={4}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {sourcePerformance.map((source) => (
                <Cell key={source.id} fill={source.chartColor} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-[-0.8px] text-text-primary">11,412</span>
          <span className="mt-1 text-xs text-text-tertiary">hồ sơ từ nguồn chính</span>
        </div>
      </div>

      <div className="space-y-2.5 border-t border-card-border pt-4">
        {sourcePerformance.slice(0, 4).map((source) => (
          <div key={source.id} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-text-secondary">
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: source.chartColor }} />
              <span className="truncate">{source.label}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2 font-semibold text-text-primary">
              {source.share}%
              <span className="font-normal text-text-tertiary">· {source.enrolled} nhập học</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
