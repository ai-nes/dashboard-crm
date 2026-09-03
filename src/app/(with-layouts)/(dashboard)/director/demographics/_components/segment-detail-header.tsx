"use client";

import { ArrowLeft } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { formatGrowth } from "./chart-utils";
import type { DemographicSegment } from "./types";

interface SegmentDetailHeaderProps {
  segment: DemographicSegment;
  onBack: () => void;
}

export default function SegmentDetailHeader({
  segment,
  onBack,
}: SegmentDetailHeaderProps) {
  const growthBadgeText = segment.growth != null ? `${formatGrowth(segment.growth)} so với tháng trước` : "Chưa đủ dữ liệu tăng trưởng";
  const isPositiveGrowth = segment.growth != null && segment.growth > 0;
  const growthBadgeColor = segment.growth == null ? "gray" : isPositiveGrowth ? "success" : "error";

  return (
    <header className="px-2 lg:px-5">
      <Button size="sm" appearance="ghost" className="mb-4 -ml-2" onPress={onBack}>
        <ArrowLeft size={16} aria-hidden="true" />
        Tổng quan nhóm học sinh
      </Button>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold tracking-wide text-brand-500 uppercase">
              Nhóm học sinh đang xem
            </span>
            <Badge color={growthBadgeColor}>
              {growthBadgeText}
            </Badge>
          </div>
          <h1 className="mt-2 text-balance text-[28px] leading-9 font-semibold tracking-[-0.6px] text-text-primary">
            {segment.name}
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {segment.description} Tối thiểu 30 học sinh để hiển thị.
          </p>
        </div>
      </div>
    </header>
  );
}
