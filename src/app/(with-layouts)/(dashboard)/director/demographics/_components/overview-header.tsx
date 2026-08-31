"use client";

import { Download1 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";

interface OverviewHeaderProps {
  onExport: () => void;
}

export default function OverviewHeader({
  onExport,
}: OverviewHeaderProps) {
  return (
    <header className="flex flex-col gap-5 rounded-xl border border-card-border bg-card-background p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color="primary">FAIP · Phân tích người học</Badge>
          <span className="text-xs text-text-tertiary">Dữ liệu mô phỏng · Kỳ tuyển sinh 2026</span>
        </div>
        <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
          Khám phá người học
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
          Tìm nhóm học sinh nên ưu tiên tư vấn.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-background-soft-50 px-3 py-1.5 text-xs font-medium text-text-secondary">
          Toàn quốc
        </span>
        <Button size="sm" appearance="outline" onPress={onExport}>
          <Download1 size={16} aria-hidden="true" />
          Xuất báo cáo
        </Button>
      </div>
    </header>
  );
}
