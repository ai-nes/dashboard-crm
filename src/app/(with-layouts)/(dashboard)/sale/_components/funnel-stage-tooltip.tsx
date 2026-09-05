"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tailgrids/core/tooltip";

interface FunnelStageTooltipProps {
  label: string;
  value: number;
  color: string;
  conversionRate: number | null;
  width: string;
}

export default function FunnelStageTooltip({ label, value, color, conversionRate, width }: FunnelStageTooltipProps) {
  return (
    <Tooltip placement="top">
      <TooltipTrigger asChild>
        <div
          className="flex h-2.5 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          style={{ width }}
          tabIndex={0}
          role="img"
          aria-label={`${label}, xem thông tin chi tiết`}
        >
          <div className="h-full w-full rounded-full" style={{ backgroundColor: color }} />
        </div>
      </TooltipTrigger>
      <TooltipContent className="normal-case">
        <p className="font-semibold">{label}</p>
        <p className="mt-0.5 font-normal">
          {value} học sinh
          {conversionRate ? ` · ${conversionRate}% so với bước trước` : " · bước đầu tiên"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
