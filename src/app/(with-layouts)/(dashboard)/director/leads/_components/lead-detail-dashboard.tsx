"use client";

import DetailTabs, {
  type DetailTabItem,
} from "@/components/common/detail-tabs";
import { Card } from "@/components/tailgrids/core/card";
import { useLeadSaleLeadQuery } from "@/hooks/use-lead-sale-leads-queries";

import LeadDetailsTab from "./lead-details-tab";
import LeadHeader from "./lead-header";
import LeadLogTab from "./lead-log-tab";
import LeadNotesTab from "./lead-notes-tab";

export default function LeadDetailDashboard({ leadId }: { leadId: string }) {
  const { data, isError, error, isPending } = useLeadSaleLeadQuery(leadId);

  if (isPending) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <p className="text-text-tertiary" role="status">
          Đang tải chi tiết Lead…
        </p>
      </main>
    );
  }

  if (isError) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <Card className="border-error-200 bg-badge-error-background p-5 text-error-600">
          <p className="text-base font-semibold">
            Không thể tải chi tiết Lead từ Frappe CRM.
          </p>
          <p className="mt-1 text-sm">
            {error?.message || "Lỗi kết nối hoặc không có quyền truy cập."}
          </p>
        </Card>
      </main>
    );
  }

  if (!data) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <Card className="border-error-200 bg-badge-error-background p-5 text-error-600">
          <p className="text-base font-semibold">Không tìm thấy Lead này.</p>
          <p className="mt-1 text-sm">
            Lead có thể đã bị xóa hoặc mã Lead không đúng.
          </p>
        </Card>
      </main>
    );
  }

  const tabs: DetailTabItem[] = [
    {
      id: "details",
      label: "Chi tiết",
      content: <LeadDetailsTab lead={data.lead} />,
    },
    {
      id: "notes",
      label: "Ghi chú",
      content: <LeadNotesTab entries={data.log} />,
    },
    { id: "log", label: "Nhật ký", content: <LeadLogTab entries={data.log} /> },
  ];

  return (
    <main
      id="main-content"
      className="min-w-0 max-w-full overflow-x-clip pb-10"
    >
      <div className="px-2 pt-4 lg:px-6">
        <LeadHeader lead={data.lead} />
      </div>
      <div className="px-2 pt-4 lg:px-6">
        <DetailTabs
          ariaLabel="Các phần trong hồ sơ Lead"
          defaultSelectedKey="details"
          tabs={tabs}
        />
      </div>
    </main>
  );
}
