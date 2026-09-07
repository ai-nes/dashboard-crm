"use client";

import DetailTabs, { type DetailTabItem } from "@/components/common/detail-tabs";
import { Card } from "@/components/tailgrids/core/card";

import { getLeadDetail, getLeadLog } from "./lead-detail-data";
import LeadDetailsTab from "./lead-details-tab";
import LeadHeader from "./lead-header";
import LeadLogTab from "./lead-log-tab";
import LeadNotesTab from "./lead-notes-tab";

export default function LeadDetailDashboard({ leadId }: { leadId: string }) {
  const lead = getLeadDetail(leadId);

  if (!lead) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <Card className="border-error-200 bg-badge-error-background p-5 text-error-600">
          <p className="font-semibold text-base">Không tìm thấy lead này.</p>
          <p className="mt-1 text-sm">Lead có thể đã bị xóa hoặc mã lead không đúng.</p>
        </Card>
      </main>
    );
  }

  const logEntries = getLeadLog(leadId);
  const tabs: DetailTabItem[] = [
    { id: "details", label: "Chi tiết", content: <LeadDetailsTab lead={lead} /> },
    { id: "notes", label: "Ghi chú", content: <LeadNotesTab entries={logEntries} /> },
    { id: "log", label: "Nhật ký", content: <LeadLogTab entries={logEntries} /> },
  ];

  return (
    <main id="main-content" className="min-w-0 max-w-full overflow-x-clip pb-10">
      <div className="px-2 pt-4 lg:px-6">
        <LeadHeader lead={lead} />
      </div>
      <div className="px-2 pt-4 lg:px-6">
        <DetailTabs ariaLabel="Các phần trong hồ sơ lead" defaultSelectedKey="details" tabs={tabs} />
      </div>
    </main>
  );
}
