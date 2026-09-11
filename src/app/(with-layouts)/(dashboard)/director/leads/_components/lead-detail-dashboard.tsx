"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/common/auth/auth-provider";
import {
  canAccessStudent,
  canConvertLeadToStudent,
  canPerformStudentAction,
  getCrmPermissions,
} from "@/components/common/auth/permissions";
import { DeleteRecordDialog } from "@/components/common/delete-record-dialog";
import DetailTabs, {
  type DetailTabItem,
} from "@/components/common/detail-tabs";
import { Card } from "@/components/tailgrids/core/card";
import { useLeadCallLogsQuery } from "@/hooks/use-lead-call-logs-query";
import {
  useConvertLeadToStudentMutation,
  useDeleteLeadMutation,
  useLeadSaleLeadQuery,
} from "@/hooks/use-lead-sale-leads-queries";

import LeadCallsTab from "./lead-calls-tab";
import LeadDetailsTab from "./lead-details-tab";
import LeadHeader from "./lead-header";
import LeadLogTab from "./lead-log-tab";
import LeadNotesTab from "./lead-notes-tab";
import LeadWorkflowSection from "./lead-workflow-section";
import { normalizeLeadStageStatus } from "./lead-status";

export default function LeadDetailDashboard({ leadId }: { leadId: string }) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const permissions = getCrmPermissions(user?.roles);
  const leadListHref = getLeadListHref(user?.roles);
  const { data, isError, error, isPending } = useLeadSaleLeadQuery(leadId);
  const [activeTab, setActiveTab] = useState("details");
  const callLogsQuery = useLeadCallLogsQuery(leadId, {
    enabled: activeTab === "calls",
  });
  const deleteMutation = useDeleteLeadMutation();
  const convertMutation = useConvertLeadToStudentMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const leadOwnership = { owner: data?.lead.owner };
  const hasLeadAccess =
    isAuthLoading ||
    (data !== null &&
      data !== undefined &&
      canAccessStudent(permissions.lead, leadOwnership, user));
  const canUpdateLead =
    !isAuthLoading &&
    canPerformStudentAction(permissions.lead, "update", leadOwnership, user);
  const canDeleteLead =
    !isAuthLoading &&
    canPerformStudentAction(permissions.lead, "delete", leadOwnership, user);
  const isLeadAssigned =
    normalizeLeadStageStatus(
      data?.lead.processingStatus ?? data?.lead.statusCode ?? data?.lead.status,
    ) === "ASSIGNED";
  const canConvertLead =
    !isAuthLoading &&
    isLeadAssigned &&
    !data?.lead.studentId &&
    canConvertLeadToStudent(user?.roles, leadOwnership, user);
  const handleConvert = () => {
    convertMutation.mutate(leadId, {
      onSuccess: (result) => {
        toast.success("Đã chuyển đổi Lead thành học sinh.");
        router.replace(
          `/director/students/${encodeURIComponent(result.student)}`,
        );
        router.refresh();
      },
      onError: (convertError) => {
        toast.error(
          convertError instanceof Error
            ? convertError.message
            : "Chưa thể chuyển đổi Lead thành học sinh.",
        );
      },
    });
  };
  const handleDelete = () => {
    deleteMutation.mutate(leadId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        toast.success("Đã xóa Lead.");
        router.replace(leadListHref);
        router.refresh();
      },
      onError: (deleteError) => {
        toast.error(
          deleteError instanceof Error
            ? deleteError.message
            : "Chưa thể xóa Lead.",
        );
      },
    });
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

  if (!isAuthLoading && !hasLeadAccess) {
    return (
      <main id="main-content" className="min-w-0 p-6">
        <Card className="border-warning-200 bg-badge-warning-background p-5 text-badge-warning-text">
          <p className="font-semibold text-base">
            Bạn không có quyền xem Lead này.
          </p>
          <p className="mt-1 text-sm">
            Quyền truy cập Lead được giới hạn theo phạm vi phân công và đội ngũ.
          </p>
        </Card>
      </main>
    );
  }

  const status = normalizeLeadStageStatus(data.lead.processingStatus);
  const result = data.lead.result;

  const tabs: DetailTabItem[] = [
    {
      id: "details",
      label: "Chi tiết",
      content: (
        <LeadDetailsTab
          canEdit={canUpdateLead}
          lead={data.lead}
          leadId={leadId}
        />
      ),
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
      content: (
        <LeadNotesTab
          canManageNotes={canUpdateLead}
          enabled={activeTab === "notes"}
          leadId={leadId}
          leadName={data.lead.name}
        />
      ),
    },
    {
      id: "log",
      label: "Nhật ký",
      content: <LeadLogTab enabled={activeTab === "log"} leadId={leadId} />,
    },
  ];

  return (
    <main
      id="main-content"
      className="min-w-0 max-w-full overflow-x-clip pb-10"
    >
      <div className="px-2 pt-4 lg:px-6">
        <LeadHeader
          backHref={leadListHref}
          lead={data.lead}
          createdAt={data.lead.createdAt ?? undefined}
          isConverting={convertMutation.isPending}
          onConvertRequest={canConvertLead ? handleConvert : undefined}
          onDeleteRequest={
            canDeleteLead ? () => setDeleteDialogOpen(true) : undefined
          }
        >
          <LeadWorkflowSection
            leadId={leadId}
            leadName={data.lead.name}
            status={status}
            result={result}
            contactNoAnswer={data.lead.contactNoAnswer}
            contactSuccess={data.lead.contactSuccess}
          />
        </LeadHeader>
      </div>
      <div className="px-2 pt-4 lg:px-6">
        <DetailTabs
          ariaLabel="Các phần trong hồ sơ Lead"
          defaultSelectedKey="details"
          onSelectionChange={setActiveTab}
          tabs={tabs}
        />
      </div>
      <DeleteRecordDialog
        isDeleting={deleteMutation.isPending}
        isOpen={deleteDialogOpen}
        onConfirm={handleDelete}
        onOpenChange={setDeleteDialogOpen}
        recordName={data.lead.name || leadId}
        recordType="Lead"
      />
    </main>
  );
}

function getLeadListHref(roles: readonly string[] | null | undefined): string {
  if (roles?.includes("CTV Sale")) return "/ctv-sale/leads";
  if (roles?.includes("Sale")) return "/sale/leads";
  return "/lead-sale/leads";
}
