"use client";

import { ArrowLeft, Bookmark1, Download1 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import type { DemographicSegment } from "./types";

interface SegmentDetailHeaderProps {
  segment: DemographicSegment;
  onBack: () => void;
  onExport: () => void;
  onSave: () => void;
}

export default function SegmentDetailHeader({
  segment,
  onBack,
  onExport,
  onSave,
}: SegmentDetailHeaderProps) {
  const growthBadgeText = segment.growth != null ? `+${segment.growth}% so với tháng trước` : "-";
  const isPositiveGrowth = segment.growth != null && segment.growth >= 20;

  return (
    <header className="px-2 lg:px-5">
      <Button size="sm" appearance="ghost" className="mb-4 -ml-2" onPress={onBack}>
        <ArrowLeft size={16} aria-hidden="true" />
        Tổng quan người học
      </Button>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold tracking-wide text-brand-500 uppercase">
              Nhóm học sinh đang xem
            </span>
            <Badge color={isPositiveGrowth ? "success" : "primary"}>
              {growthBadgeText}
            </Badge>
          </div>
          <h1 className="mt-2 text-balance text-[28px] leading-9 font-semibold tracking-[-0.6px] text-text-primary">
            {segment.name}
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {segment.description} Dữ liệu từ đầu mùa tuyển sinh 2026 · tối thiểu 30 hồ sơ để hiển thị.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" appearance="outline" onPress={onExport}>
            <Download1 size={16} aria-hidden="true" />
            Xuất báo cáo
          </Button>
          <Button size="sm" onPress={onSave}>
            <Bookmark1 size={16} aria-hidden="true" />
            Lưu nhóm này
          </Button>
        </div>
      </div>
    </header>
  );
}
