import { Badge } from "@/components/tailgrids/core/badge";

import type { SaleDashboardLeadRecord } from "./sale-dashboard-detail.types";
import {
  SaleDetailCallout,
  SaleDetailFacts,
  SaleDetailSection,
} from "./sale-detail-primitives";

interface LeadDetailPanelProps {
  lead: SaleDashboardLeadRecord;
  timezone: string;
}

const processingLabel: Record<
  SaleDashboardLeadRecord["processingStatus"],
  { label: string; color: "sky" | "warning" | "gray" | "primary" }
> = {
  NEW: { label: "Mới tiếp nhận", color: "sky" },
  PROCESSING: { label: "Đang xử lý", color: "warning" },
  PROCESSED: { label: "Đã xử lý", color: "gray" },
  ASSIGNED: { label: "Đã phân công", color: "primary" },
  CLOSED: { label: "Đã đóng", color: "gray" },
};

const resolutionLabel: Record<SaleDashboardLeadRecord["resolution"], string> = {
  PENDING: "Chờ phân loại",
  MATCHED: "Đã ghép hồ sơ",
  CREATED: "Đã tạo hồ sơ học sinh",
  DUPLICATE: "Trùng lặp",
  INVALID: "Không hợp lệ",
  SPAM: "Spam",
  FAILED: "Xử lý thất bại",
};

function formatDateTime(value: string, timezone: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(date);
}

export default function LeadDetailPanel({
  lead,
  timezone,
}: LeadDetailPanelProps) {
  const status = processingLabel[lead.processingStatus];
  const contactTotal = lead.contactNoAnswer + lead.contactSuccess;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge color={status.color}>{status.label}</Badge>
        <Badge color="gray">{resolutionLabel[lead.resolution]}</Badge>
      </div>

      <SaleDetailSection title="Thông tin Lead">
        <SaleDetailFacts
          facts={[
            { label: "Mã Lead", value: lead.leadCode },
            { label: "Nguồn", value: lead.source },
            { label: "Trường", value: lead.school ?? "Chưa cập nhật" },
            { label: "Số điện thoại", value: lead.phone ?? "Chưa cập nhật" },
            {
              label: "Thời điểm tiếp nhận",
              value: formatDateTime(lead.createdAt, timezone),
            },
            {
              label: "Lần liên hệ",
              value: `${contactTotal} lần · ${lead.contactSuccess} thành công · ${lead.contactNoAnswer} chưa nghe máy`,
            },
          ]}
        />
      </SaleDetailSection>

      <SaleDetailCallout title="Bước tiếp theo">
        {lead.nextAction}
      </SaleDetailCallout>

      <p className="text-xs text-text-tertiary">
        Trạng thái xử lý và kết quả Lead hiển thị theo enum hiện có của CRM.
      </p>
    </div>
  );
}
