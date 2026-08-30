"use client";

import { ArrowRight, Download1 } from "@tailgrids/icons";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";

export default function RegionalPerformanceHeader() {
  return (
    <header>
      <Card className="flex flex-col gap-5 border border-card-border p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="primary">FAIP · Hiệu suất khu vực</Badge>
            <span className="text-xs text-text-tertiary">Dữ liệu mô phỏng · Kỳ tuyển sinh 2026</span>
          </div>
          <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
            Hiệu suất tuyển sinh theo khu vực
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            Theo dõi vùng đang đạt chỉ tiêu, quá tải hoặc cần hỗ trợ.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-background-soft-50 px-3 py-1.5 text-xs font-medium text-text-secondary">Toàn bộ khu vực</span>
          <Link
            href="/director/ai/next-best-action"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-button-primary-background px-3 text-sm font-medium text-button-primary-text transition hover:bg-button-primary-hover-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            Xem kế hoạch can thiệp
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Button appearance="outline" size="sm" onPress={() => toast.success("Đã tạo báo cáo hiệu suất khu vực.")}>
            <Download1 size={16} aria-hidden="true" />
            Xuất báo cáo
          </Button>
        </div>
      </Card>
    </header>
  );
}
