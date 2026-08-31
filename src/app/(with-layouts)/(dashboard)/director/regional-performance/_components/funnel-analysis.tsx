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
          <CardTitle>Hồ sơ qua từng giai đoạn</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">
            {province.name} · tính từ hồ sơ ban đầu.
          </p>
        </div>
      </CardHeader>
      <div className="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
        <span>Giai đoạn</span>
        <span>Còn lại</span>
      </div>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.stage}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center text-[11px] font-semibold text-primary-500">
                  {index + 1}
                </span>
                <span className="truncate text-xs font-medium text-text-secondary">
                  {item.stage}
                </span>
              </div>
              <span className="shrink-0 text-xs font-semibold text-text-primary">
                {item.remaining.toFixed(1).replace(".", ",")}%
              </span>
            </div>
            <div className="mt-1 flex h-8 justify-center">
              <div
                className={
                  index === data.length - 1
                    ? "mx-auto flex h-full items-center justify-center rounded-full bg-success-500 px-3 text-xs font-semibold text-white"
                    : "mx-auto flex h-full items-center justify-center rounded-full bg-primary-500 px-3 text-xs font-semibold text-white"
                }
                style={{ width: String(Math.max(18, item.remaining)) + "%" }}
              >
                {item.value.toLocaleString("vi-VN")}
              </div>
            </div>
            <p className="mt-1 text-right text-[11px] text-text-tertiary">
              {index === 0
                ? "Hồ sơ ban đầu"
                : item.stepConversion.toFixed(1).replace(".", ",") +
                  "% sang bước sau"}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default memo(FunnelAnalysis);
