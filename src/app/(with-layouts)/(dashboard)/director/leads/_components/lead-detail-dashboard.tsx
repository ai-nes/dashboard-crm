"use client";

import { useState } from "react";

import DetailTabs, {
  type DetailTabItem,
} from "@/components/common/detail-tabs";
import { Card } from "@/components/tailgrids/core/card";
import { useLeadCallLogsQuery } from "@/hooks/use-lead-call-logs-query";
import { useLeadSaleLeadQuery } from "@/hooks/use-lead-sale-leads-queries";

import LeadCallsTab from "./lead-calls-tab";
import LeadDetailsTab from "./lead-details-tab";
import LeadHeader from "./lead-header";
import LeadLogTab from "./lead-log-tab";
import LeadNotesTab from "./lead-notes-tab";
import LeadWorkflowSection from "./lead-workflow-section";
import {
  normalizeLeadStageStatus,
  type LeadResultStatus,
  type LeadStageStatus,
} from "./lead-status";
import type { LeadDetail } from "./types";

export default function LeadDetailDashboard({ leadId }: { leadId: string }) {
  const { data, isError, error, isPending } = useLeadSaleLeadQuery(leadId);
  const callLogsQuery = useLeadCallLogsQuery(leadId);
  const [workflowDraft, setWorkflowDraft] = useState<
    Partial<Pick<LeadDetail, "processingStatus" | "result">>
  >({});

  const handleStatusChange = (status: LeadStageStatus) => {
    const nextResult =
      status === "ASSIGNED" || status === "CLOSED"
        ? workflowDraft.result ?? data?.lead.result ?? ""
        : "";
    setWorkflowDraft((prev) => ({
      ...prev,
      processingStatus: status,
      result: nextResult,
    }));
  };

  const handleResultChange = (result: LeadResultStatus) => {
    setWorkflowDraft((prev) => ({ ...prev, result }));
  };

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

  const status = normalizeLeadStageStatus(
    workflowDraft.processingStatus ?? data.lead.processingStatus,
  );
  const result = workflowDraft.result ?? data.lead.result;

  const tabs: DetailTabItem[] = [
    {
      id: "details",
      label: "Chi tiết",
      content: <LeadDetailsTab lead={data.lead} />,
    },
    {
      id: "calls",
      label: "Cuộc gọi",
      content: (
        <LeadCallsTab
          calls={callLogsQuery.data?.calls ?? []}
          isLoading={callLogsQuery.isPending}
          isError={callLogsQuery.isError}
          onRetry={() => void callLogsQuery.refetch()}
          onCallUpdated={() => void callLogsQuery.refetch()}
        />
      ),
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
        <LeadHeader lead={data.lead} createdAt={data.lead.createdAt ?? undefined}>
          <LeadWorkflowSection
            leadName={data.lead.name}
            status={status}
            result={result}
            contactNoAnswer={data.lead.contactNoAnswer}
            contactSuccess={data.lead.contactSuccess}
            onStatusChange={handleStatusChange}
            onResultChange={handleResultChange}
          />
        </LeadHeader>
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
