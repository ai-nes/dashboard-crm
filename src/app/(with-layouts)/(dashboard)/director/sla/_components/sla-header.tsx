"use client";

import { ArrowRight } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";

export default function SlaHeader() {
  return (
    <Card className="flex flex-col gap-5 p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color="primary">M-10 · Theo dõi thời hạn</Badge>
          <span className="text-xs text-text-tertiary">Dữ liệu mô phỏng · Kỳ tuyển sinh 2026</span>
        </div>
        <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
          Thời hạn xử lý hồ sơ
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
          Biết hồ sơ nào sắp trễ, đã trễ và cần can thiệp trước khi mất cơ hội.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/director/ai/next-best-action"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-button-primary-background px-3 text-sm font-medium text-button-primary-text transition hover:bg-button-primary-hover-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          Xem việc cần xử lý
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
