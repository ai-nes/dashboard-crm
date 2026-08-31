"use client";

import { memo, useMemo } from "react";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { RegionPerformance } from "./types";

function FunnelAnalysis({ province }: { province: RegionPerformance }) {
  const data = useMemo(() => {
    const firstValue = province.funnel[0]?.value ?? 1;
    return province.funnel.map((item, index, rows) => ({
      ...item,
      remaining: (item.value / firstValue) * 100,
      stepConversion:
        index === 0
          ? 100
          : (item.value / (rows[index - 1]?.value ?? item.value)) * 100,
    }));
  }, [province]);

  return (
    <Card className="min-w-0 p-5">
      <CardHeader className="mb-4">
        <div>
          <CardTitle>Phễu tuyển sinh theo tỉnh</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">
            {province.name} · tỷ lệ tính từ hồ sơ đăng ký ban đầu.
          </p>
        </div>
      </CardHeader>
      <div className="space-y-4">
        {data.map((item) => (
          <div
            key={item.stage}
            className="grid grid-cols-[minmax(80px,0.7fr)_minmax(0,2fr)_auto] items-center gap-3"
          >
            <span className="text-xs font-medium text-text-secondary">
              {item.stage}
            </span>
            <div className="h-8 overflow-hidden rounded-md bg-background-soft-50">
              <div
                className="flex h-full min-w-20 items-center rounded-md bg-primary-500 px-3 text-xs font-semibold text-white"
                style={{ width: `${Math.max(18, item.remaining)}%` }}
              >
                {item.value.toLocaleString("vi-VN")}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-text-primary">
                {item.remaining.toFixed(1).replace(".", ",")}%
              </p>
              <p className="mt-0.5 text-[11px] text-text-tertiary">
                {item.stepConversion.toFixed(1).replace(".", ",")}% chuyển đổi
                bước
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default memo(FunnelAnalysis);
