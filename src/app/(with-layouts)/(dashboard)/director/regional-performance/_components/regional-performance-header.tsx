"use client";

import { memo, type ReactNode } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
import { REGIONAL_SCOPE_LABEL } from "./data";

function RegionalPerformanceHeader({ children }: { children?: ReactNode }) {
  return (
    <header>
      <Card className="p-5 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="primary">Hiệu suất tuyển sinh</Badge>
              <span className="text-xs text-text-tertiary">Niên khóa 2026</span>
            </div>
            <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
              Hiệu suất tuyển sinh theo địa bàn
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              So sánh chỉ tiêu, hồ sơ, nhập học và tải xử lý tại 7 địa bàn trọng
              điểm.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <span className="rounded-full bg-background-soft-50 px-3 py-1.5 text-xs font-medium text-text-secondary">
              {REGIONAL_SCOPE_LABEL}
            </span>
            {children}
          </div>
        </div>
      </Card>
    </header>
  );
}

export default memo(RegionalPerformanceHeader);
