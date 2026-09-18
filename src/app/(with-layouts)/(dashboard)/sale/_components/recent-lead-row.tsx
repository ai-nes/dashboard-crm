import { ArrowRight } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";

import type { SaleDashboardLeadRecord } from "./sale-dashboard-detail.types";

interface RecentLeadRowProps {
  lead: SaleDashboardLeadRecord;
  timezone: string;
  onOpen: (lead: SaleDashboardLeadRecord) => void;
}

const leadStatusPresentation = {
  NEW: { label: "Mới tiếp nhận", color: "sky" },
  PROCESSING: { label: "Đang xử lý", color: "warning" },
  PROCESSED: { label: "Đã xử lý", color: "gray" },
  ASSIGNED: { label: "Đã phân công", color: "primary" },
  CLOSED: { label: "Đã đóng", color: "gray" },
} as const;

function formatCreatedAt(value: string, timezone: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Thời điểm chưa rõ";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(date);
}

export default function RecentLeadRow({
  lead,
  timezone,
  onOpen,
}: RecentLeadRowProps) {
  const status = leadStatusPresentation[lead.processingStatus];

  return (
    <li>
      <Button
        type="button"
        variant="ghost"
        appearance="ghost"
        onPress={() => onOpen(lead)}
        aria-label={`Xem chi tiết lead ${lead.name}, mã ${lead.leadCode}`}
        className="group h-auto w-full cursor-pointer justify-start rounded-none px-4 py-3.5 text-left transition-colors hover:bg-card-background hover:text-text-primary active:bg-background-soft-50 first:rounded-t-xl last:rounded-b-xl sm:px-5"
      >
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-xs font-semibold text-badge-primary-text"
          aria-hidden="true"
        >
          {lead.name.split(/\s+/).slice(-1)[0]?.slice(0, 1) ?? "L"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-sm font-semibold text-text-primary transition-colors group-hover:text-primary-700 group-focus-visible:text-primary-700">
              {lead.name}
            </span>
            <span className="text-[11px] text-text-tertiary">
              {lead.leadCode}
            </span>
          </span>
          <span className="mt-1 block truncate text-xs text-text-secondary">
            {lead.school ?? "Trường chưa cập nhật"} · {lead.source}
          </span>
          <span className="mt-2 flex flex-wrap items-center gap-2">
            <Badge color={status.color} size="sm">
              {status.label}
            </Badge>
            <span className="text-[11px] text-text-tertiary">
              {formatCreatedAt(lead.createdAt, timezone)}
            </span>
          </span>
        </span>
        <ArrowRight
          size={15}
          aria-hidden="true"
          className="shrink-0 text-text-tertiary transition group-hover:translate-x-0.5 group-hover:text-primary-600 group-focus-visible:text-primary-600"
        />
      </Button>
    </li>
  );
}
