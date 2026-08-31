"use client";

import { ArrowRight, Download1 } from "@tailgrids/icons";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import type { FieldActivityMeta } from "@/services/api/director-school-field-activity";

interface SchoolFieldActivityHeaderProps {
  meta: FieldActivityMeta;
}

export default function SchoolFieldActivityHeader({ meta }: SchoolFieldActivityHeaderProps) {
  const statusLabel = meta.status === "available" ? "Dữ liệu CRM" : meta.status === "partial" ? "Dữ liệu một phần" : "Chưa có dữ liệu";

  return (
    <header>
      <Card className="flex flex-col gap-5 p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="primary">M-11 · Hoạt động thực địa</Badge>
            <span className="text-xs text-text-tertiary">{statusLabel} · Kỳ tuyển sinh {meta.admissionYear}</span>
          </div>
          <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
            Hoạt động trường & thực địa
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            Theo dõi hoạt động đã triển khai, kết quả thu được và phần cần cải thiện.
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
          <Button appearance="outline" size="sm" onPress={() => toast.success("Đã tạo báo cáo hoạt động thực địa.")}>
            <Download1 size={16} aria-hidden="true" />
            Xuất báo cáo
          </Button>
        </div>
      </Card>
    </header>
  );
}
