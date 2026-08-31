"use client";

import { Download1 } from "@tailgrids/icons";
import { memo, type ReactNode } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { REGIONAL_SCOPE_LABEL } from "./data";

function RegionalPerformanceHeader({ children }: { children?: ReactNode }) {
  return (
    <header>
      <Card className="border border-card-border p-5 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="primary">FAIP · Hiệu suất tuyển sinh</Badge>
              <span className="text-xs text-text-tertiary">
                Dữ liệu mô phỏng · Kỳ tuyển sinh 2026
              </span>
            </div>
            <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
              Hiệu suất tuyển sinh theo tỉnh
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              Theo dõi 7 tỉnh trọng điểm đang đạt chỉ tiêu, quá tải hoặc cần hỗ
              trợ để điều phối nhân sự và kế hoạch tuyển sinh.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <span className="rounded-full bg-background-soft-50 px-3 py-1.5 text-xs font-medium text-text-secondary">
              {REGIONAL_SCOPE_LABEL}
            </span>
            {children}
            <Button
              appearance="outline"
              size="sm"
              onPress={() =>
                toast.success("Đã tạo báo cáo hiệu suất tuyển sinh.")
              }
            >
              <Download1 size={16} aria-hidden="true" />
              Xuất báo cáo
            </Button>
          </div>
        </div>
      </Card>
    </header>
  );
}

export default memo(RegionalPerformanceHeader);
