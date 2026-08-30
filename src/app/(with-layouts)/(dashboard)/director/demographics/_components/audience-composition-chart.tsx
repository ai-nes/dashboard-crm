"use client";

import { Pie, PieChart, Tooltip } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { audienceCompositionData as defaultAudience } from "@/services/api/demographics/data";
import type { AudienceComposition } from "@/services/api/demographics/types";
import OverviewTooltip from "./overview-tooltip";

interface AudienceCompositionChartProps {
  audience?: AudienceComposition;
}

export default function AudienceCompositionChart({ audience = defaultAudience }: AudienceCompositionChartProps) {
  const total = audience.total;
  const gender = audience.gender;
  const profiles = audience.profiles;

  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden bg-card-background">
      <CardHeader className="mb-3 items-start">
        <div>
          <CardTitle>Cơ cấu hồ sơ học sinh</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Phân bổ theo giới tính và đặc điểm hồ sơ.</p>
        </div>
        <span className="text-xs font-medium text-text-tertiary">{total.toLocaleString("vi-VN")} hồ sơ</span>
      </CardHeader>
      <div className="relative mx-auto h-52 w-full max-w-72">
        <ChartContainer className="h-full w-full" width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <Tooltip content={<OverviewTooltip suffix="%" />} />
            <Pie
              data={gender}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={86}
              paddingAngle={3}
              cornerRadius={6}
              stroke="var(--card-background)"
              strokeWidth={3}
              isAnimationActive={false}
            />
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <strong className="text-2xl font-semibold tracking-[-0.5px] text-text-primary">{total.toLocaleString("vi-VN")}</strong>
          <span className="mt-1 text-[11px] text-text-tertiary">hồ sơ</span>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-text-secondary">
        {gender.map((item) => (
          <span key={item.name} className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: item.fill || "var(--brand-500)" }} />
            {item.name} {item.value}%
          </span>
        ))}
      </div>
      <div className="space-y-3 border-t border-card-border pt-4">
        {profiles.map((profile) => (
          <div key={profile.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="text-text-secondary">{profile.label}</span>
              <span className="font-semibold text-text-primary">
                {profile.value}% <span className="font-normal text-text-tertiary">· {profile.detail || `${profile.count?.toLocaleString("vi-VN") ?? 0} hồ sơ`}</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-background-gray-secondary">
              <div className={`h-full rounded-full ${profile.color || "bg-brand-500"}`} style={{ width: `${profile.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
