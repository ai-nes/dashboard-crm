"use client";

import { RefreshCircle1Clockwise } from "@tailgrids/icons";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import type { DirectorNextBestActionMeta } from "@/services/api/director-next-best-action";

interface NextBestActionHeaderProps {
  meta?: DirectorNextBestActionMeta;
  responseWindowHours?: number;
  onRefresh?: () => void | Promise<void>;
}

export default function NextBestActionHeader({
  meta,
  responseWindowHours = 8,
  onRefresh,
}: NextBestActionHeaderProps) {
  const dataLabel = !meta
    ? "Đang tải dữ liệu"
    : meta.status === "available"
      ? "Dữ liệu thực tế"
      : meta.status === "ai_unavailable"
        ? "AI không khả dụng"
        : "Dữ liệu một phần";

  return (
    <Card className="flex flex-col gap-5 border border-card-border p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color="primary">M-07 · Việc cần xử lý</Badge>
          <span className="text-xs text-text-tertiary">
            {dataLabel} · Kỳ tuyển sinh {meta?.admissionYear ?? "—"}
          </span>
          <span className="text-xs text-text-tertiary">
            Mốc xử lý: {responseWindowHours} giờ làm việc
          </span>
        </div>
        <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
          Việc cần xử lý
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
          Ưu tiên hồ sơ theo hạn xử lý và xem ngay việc cần làm tiếp theo.
        </p>
      </div>
      <Button
        appearance="outline"
        size="sm"
        onPress={
          onRefresh ??
          (() => toast.success("Đã làm mới danh sách việc cần xử lý."))
        }
      >
        <RefreshCircle1Clockwise size={16} aria-hidden="true" />
        Làm mới
      </Button>
    </Card>
  );
}
