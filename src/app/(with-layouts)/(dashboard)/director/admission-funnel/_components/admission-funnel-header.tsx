"use client";

import { ArrowRight, Download1 } from "@tailgrids/icons";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";

import { useAdmissionFunnelData } from "./admission-funnel-context";

function formatAsOf(value: string, timezone: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: timezone,
  });
}

export default function AdmissionFunnelHeader() {
  const { meta } = useAdmissionFunnelData();
  const statusLabel = meta.status === "partial" ? "Dữ liệu một phần" : "Dữ liệu sẵn sàng";

  return (
    <Card className="flex flex-col gap-5 border border-card-border p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color="primary">M-05 · Phễu tuyển sinh</Badge>
          <span className="text-xs text-text-tertiary">
            {statusLabel} · {meta.scopeLabel} · Kỳ tuyển sinh {meta.admissionYear} · Cập nhật {formatAsOf(meta.asOf, meta.timezone)}
          </span>
        </div>
        <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
          Phễu tuyển sinh
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
          Theo dõi số hồ sơ còn lại qua từng bước, từ tiềm năng đến nhập học.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/director/ai/next-best-action"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-button-primary-background px-3 text-sm font-medium text-button-primary-text transition hover:bg-button-primary-hover-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          Xem kế hoạch can thiệp
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <Button appearance="outline" size="sm" onPress={() => toast.success("Đã tạo báo cáo phễu tuyển sinh.")}>
          <Download1 size={16} aria-hidden="true" />
          Xuất báo cáo
        </Button>
      </div>
    </Card>
  );
}
