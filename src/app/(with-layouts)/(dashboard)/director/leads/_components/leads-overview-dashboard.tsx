"use client";

import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { Bolt1, Play, Plus, UploadCloud } from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/common/auth/auth-provider";
import {
  getCrmPermissions,
  hasCrmCapability,
} from "@/components/common/auth/permissions";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Pagination } from "@/components/tailgrids/core/pagination";
import {
  leadAssignmentBatchKeys,
  useRunUnassignedLeadAssignmentMutation,
} from "@/hooks/use-lead-assignment-batch-queries";
import { useLeadSaleCampaignsQuery } from "@/hooks/use-lead-sale-campaign-queries";
import {
  leadSaleLeadsKeys,
  useCreateLeadMutation,
  useImportLeadFileMutation,
  useLeadSaleLeadsQuery,
  useProcessNewLeadsMutation,
} from "@/hooks/use-lead-sale-leads-queries";
import type {
  LeadCreateFields,
  LeadImportMapping,
  LeadImportResponse,
  LeadListParams,
} from "@/services/api/lead-sale";

import LeadList, { leadListGrid } from "./lead-list";
import LeadImportDialog from "./lead-import-dialog";
import LeadListToolbar from "./lead-list-toolbar";
import LeadListSkeleton from "./lead-list-skeleton";
import { type LeadResultFilter, type LeadStageStatus } from "./lead-status";
import QuickCreateLeadDialog from "./quick-create-lead-dialog";

const pageSize = 10;

export default function LeadsOverviewDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const permissions = getCrmPermissions(user?.roles);
  const canCreateLead = permissions.lead.canCreate && !isAuthLoading;
  const canManageLeadIntake = permissions.lead.canAssign && !isAuthLoading;
  const canAssignLead =
    !isAuthLoading && hasCrmCapability(user, "student.routing.operate");
  const queryClient = useQueryClient();
  const runUnassignedMutation = useRunUnassignedLeadAssignmentMutation();
  const createMutation = useCreateLeadMutation();
  const importMutation = useImportLeadFileMutation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const processNewLeadsMutation = useProcessNewLeadsMutation();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStageStatus | "all">("all");
  const [resolution, setResolution] = useState<LeadResultFilter | "all">("all");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [campaign, setCampaign] = useState("");
  const [page, setPage] = useState(1);

  const campaignsQuery = useLeadSaleCampaignsQuery({
    leadOnly: true,
  });
  const availableCampaigns = campaignsQuery.data?.campaigns ?? [];
  const listParams: LeadListParams = {
    admissionYear: 2026,
    page,
    pageSize,
    q: query || undefined,
    status: status === "all" ? undefined : status,
    resolution: resolution === "all" ? undefined : resolution,
    campaign: campaign || undefined,
    order,
  };
  const {
    data: response,
    isError,
    error,
    isPending,
    isPlaceholderData,
  } = useLeadSaleLeadsQuery(listParams, { placeholderData: keepPreviousData });

  const leads = response?.data ?? [];
  const meta = response?.meta;
  // Intake is a two-step flow: every NEW Lead must pass "Xử lý Lead" before
  // "Phân công Lead" has anything to hand out, so the header offers exactly the
  // step that is due. Both counts span the whole intake year, not the filter.
  const pendingNewCount = meta?.pendingNew ?? 0;
  const readyToAssignCount = meta?.readyToAssign ?? 0;
  const hasPendingNew = pendingNewCount > 0;
  const totalCount = meta?.total ?? 0;
  const totalPages = Math.max(
    1,
    meta?.totalPages ?? Math.ceil(totalCount / pageSize),
  );
  const currentPage = Math.min(page, totalPages);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const handleStatusChange = (value: LeadStageStatus | "all") => {
    setStatus(value);
    setPage(1);
  };

  const handleResolutionChange = (value: LeadResultFilter | "all") => {
    setResolution(value);
    setPage(1);
  };

  const handleOrderChange = (value: "asc" | "desc") => {
    setOrder(value);
    setPage(1);
  };

  const handleCampaignChange = (value: string) => {
    setCampaign(value);
    setPage(1);
  };

  const resetFilters = () => {
    setQuery("");
    setStatus("all");
    setResolution("all");
    setOrder("desc");
    setCampaign("");
    setPage(1);
  };

  const handleCreateLead = async (fields: LeadCreateFields) => {
    await createMutation.mutateAsync(fields);
    setCreateDialogOpen(false);
    setPage(1);
    toast.success("Đã tạo Lead.");
  };

  const handleImportLeads = async (
    file: File,
    campaignCode: string,
    mapping: LeadImportMapping[],
  ): Promise<LeadImportResponse> => {
    const result = await importMutation.mutateAsync({
      file,
      campaignCode,
      mapping,
    });
    setPage(1);
    const total = result.total;
    const failed = result.failed;
    if (failed > 0) {
      toast.warning(`Đã tạo ${result.created}/${total} Lead.`, {
        description: `${failed} dòng chưa được nhập; vui lòng kiểm tra lại file.`,
      });
    } else {
      toast.success(`Đã tạo ${result.created}/${total} Lead.`);
      setImportDialogOpen(false);
    }
    return result;
  };

  const runLeadProcessing = async () => {
    try {
      const { summary } = await processNewLeadsMutation.mutateAsync({
        admissionYear: listParams.admissionYear,
      });

      if (!summary.scanned) {
        toast.info("Không có Lead mới cần xử lý");
        return;
      }

      const outcome = [
        `${summary.processed} Lead sẵn sàng phân công`,
        `${summary.closed} Lead đóng do thiếu số điện thoại, tỉnh, trường THPT hoặc ngành`,
      ];
      if (summary.skipped) outcome.push(`${summary.skipped} Lead bỏ qua`);
      if (summary.failed) outcome.push(`${summary.failed} Lead lỗi`);

      toast.success(`Đã xử lý ${summary.scanned} Lead`, {
        description: `${outcome.join("; ")}.`,
      });
    } catch (mutationError) {
      toast.error("Không thể xử lý Lead", {
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Vui lòng thử lại.",
      });
    }
  };

  const runLeadAssignment = async () => {
    try {
      const result = await runUnassignedMutation.mutateAsync({});
      await queryClient.invalidateQueries({ queryKey: leadSaleLeadsKeys.all });
      await queryClient.invalidateQueries({
        queryKey: leadAssignmentBatchKeys.all,
      });

      if (!result.batch) {
        toast.info("Không có Lead chưa phân công", {
          description:
            result.message ?? "Tất cả Lead đã xử lý đều đã có người phụ trách.",
        });
        return;
      }

      toast.success("Đã phân công Lead", {
        description: `${result.batch.summary.assigned} Lead đã được giao cho Sale/CTV; ${result.batch.summary.manualReview} Lead cần rà soát.`,
      });
    } catch (mutationError) {
      toast.error("Không thể phân công Lead", {
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Vui lòng thử lại.",
      });
    }
  };

  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      {isError && (
        <Card className="border-error-200 bg-badge-error-background p-4 text-error-600">
          <p className="text-sm font-semibold">
            Không thể tải danh sách Lead từ Frappe CRM
          </p>
          <p className="mt-1 text-xs">
            {error?.message || "Lỗi kết nối hoặc không có quyền truy cập."}
          </p>
        </Card>
      )}

      <header className="flex flex-col gap-5 rounded-xl border border-card-border bg-card-background p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="primary">FAIP · Danh sách Lead</Badge>
            <span className="text-xs text-text-tertiary">
              Dữ liệu tuyển sinh · Kỳ {meta?.admissionYear ?? 2026}
            </span>
          </div>
          <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
            Danh sách Leads
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            Toàn cảnh Lead tiếp nhận trước khi được phân công cho đội ngũ Sale.
          </p>
        </div>
        {(canCreateLead || canManageLeadIntake) && (
          <div className="flex shrink-0 flex-col items-end gap-2 max-sm:w-full">
            <div className="flex flex-wrap items-center justify-end gap-3 max-sm:w-full">
              {canCreateLead && (
                <Button
                  appearance="outline"
                  className="shrink-0 max-sm:w-full"
                  onPress={() => setImportDialogOpen(true)}
                  size="md"
                  aria-label="Import Lead từ file"
                >
                  <UploadCloud size={18} aria-hidden="true" />
                  Import Excel
                </Button>
              )}
              {canCreateLead && (
                <Button
                  className="shrink-0 max-sm:w-full"
                  onPress={() => setCreateDialogOpen(true)}
                  size="md"
                  aria-label="Tạo Lead nhanh"
                >
                  <Plus size={18} aria-hidden="true" />
                  Tạo Lead nhanh
                </Button>
              )}
              {canManageLeadIntake &&
                meta &&
                (hasPendingNew ? (
                  <Button
                    size="md"
                    variant="primary"
                    appearance="fill"
                    onPress={runLeadProcessing}
                    isDisabled={processNewLeadsMutation.isPending}
                    aria-label="Xử lý các Lead mới trước khi phân công"
                  >
                    <Play size={18} aria-hidden="true" />
                    {processNewLeadsMutation.isPending
                      ? "Đang xử lý…"
                      : `Xử lý Lead (${pendingNewCount})`}
                  </Button>
                ) : (
                  <Button
                    size="md"
                    variant="primary"
                    appearance="fill"
                    onPress={runLeadAssignment}
                    isDisabled={runUnassignedMutation.isPending}
                    aria-label="Phân công các Lead đã xử lý cho đội ngũ Sale"
                  >
                    <Bolt1 size={18} aria-hidden="true" />
                    {runUnassignedMutation.isPending
                      ? "Đang phân công…"
                      : "Phân công Lead"}
                  </Button>
                ))}
            </div>
            {canManageLeadIntake && meta && !hasPendingNew && (
              <p className="text-right text-xs text-text-tertiary max-sm:w-full max-sm:text-left">
                {`${readyToAssignCount} Lead đã xử lý đang chờ phân công.`}
              </p>
            )}
          </div>
        )}
      </header>

      <LeadListToolbar
        query={query}
        status={status}
        resolution={resolution}
        order={order}
        campaign={campaign}
        campaigns={availableCampaigns}
        campaignLoading={campaignsQuery.isPending}
        campaignError={campaignsQuery.error?.message}
        resultCount={totalCount}
        onQueryChange={handleQueryChange}
        onStatusChange={handleStatusChange}
        onResolutionChange={handleResolutionChange}
        onOrderChange={handleOrderChange}
        onCampaignChange={handleCampaignChange}
        onReset={resetFilters}
      />

      <Card className="min-w-0 overflow-hidden p-0">
        <div>
          <div>
            <div
              className={`hidden ${leadListGrid} items-center gap-4 border-b border-card-border bg-background-soft-50 px-5 py-3 text-xs font-medium text-text-tertiary lg:grid`}
              aria-hidden="true"
            >
              <span className="min-w-0 truncate">Mã Lead</span>
              <span className="min-w-0 truncate">Họ và Tên</span>
              <span className="min-w-0 truncate">Di động</span>
              <span className="min-w-0 truncate">Nguồn</span>
              <span className="min-w-0 truncate">Trạng thái lead</span>
              <span className="min-w-0 truncate">Kết quả</span>
              <span className="min-w-0 truncate">Người phụ trách</span>
              <span className="min-w-0 truncate">Ngày tạo</span>
            </div>
            {isPending && !response ? (
              <LeadListSkeleton />
            ) : (
              <LeadList canAssign={canAssignLead} leads={leads} />
            )}
          </div>
        </div>

        {totalCount > 0 && (
          <div className="flex flex-col gap-3 border-t border-card-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <p className="shrink-0 whitespace-nowrap text-xs text-text-secondary">
                Hiển thị{" "}
                <span className="font-semibold text-text-primary">
                  {(currentPage - 1) * pageSize + 1}–
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-semibold text-text-primary">
                  {totalCount}
                </span>{" "}
                Lead
              </p>
              {isPlaceholderData && (
                <span className="text-xs text-text-tertiary" role="status">
                  Đang tải trang…
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center justify-end max-sm:w-full">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(nextPage) =>
                  setPage(Math.min(Math.max(1, nextPage), totalPages))
                }
                variant="compact"
                isDisabled={isPlaceholderData}
              />
            </div>
          </div>
        )}
      </Card>

      {canCreateLead && (
        <QuickCreateLeadDialog
          isOpen={createDialogOpen}
          isSubmitting={createMutation.isPending}
          onOpenChange={setCreateDialogOpen}
          onCreate={handleCreateLead}
        />
      )}
      {canCreateLead && (
        <LeadImportDialog
          isOpen={importDialogOpen}
          isSubmitting={importMutation.isPending}
          onOpenChange={setImportDialogOpen}
          onImport={handleImportLeads}
        />
      )}
    </main>
  );
}
