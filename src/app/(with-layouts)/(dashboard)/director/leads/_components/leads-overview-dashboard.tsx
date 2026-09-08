"use client";

import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { Bolt1, Plus } from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/common/auth/auth-provider";
import { getCrmPermissions } from "@/components/common/auth/permissions";
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
  useLeadSaleLeadsQuery,
} from "@/hooks/use-lead-sale-leads-queries";
import type {
  LeadCreateFields,
  LeadListItem,
  LeadListParams,
} from "@/services/api/lead-sale";

import LeadList, { leadListGrid } from "./lead-list";
import LeadListToolbar from "./lead-list-toolbar";
import {
  type LeadResultFilter,
  type LeadResultStatus,
  type LeadStageStatus,
} from "./lead-status";
import QuickCreateLeadDialog from "./quick-create-lead-dialog";

const pageSize = 10;
type LeadControlDraft = Partial<
  Pick<LeadListItem, "result">
>;

export default function LeadsOverviewDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const permissions = getCrmPermissions(user?.roles);
  const canCreateLead = permissions.lead.canCreate && !isAuthLoading;
  const queryClient = useQueryClient();
  const runUnassignedMutation = useRunUnassignedLeadAssignmentMutation();
  const createMutation = useCreateLeadMutation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStageStatus | "all">("all");
  const [resolution, setResolution] = useState<LeadResultFilter | "all">(
    "all",
  );
  const [campaign, setCampaign] = useState("");
  const [page, setPage] = useState(1);
  const [controlDrafts, setControlDrafts] = useState<
    Record<string, LeadControlDraft>
  >({});

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
  };
  const {
    data: response,
    isError,
    error,
    isPending,
    isPlaceholderData,
  } = useLeadSaleLeadsQuery(listParams, { placeholderData: keepPreviousData });

  const leads = response?.data ?? [];
  const displayedLeads = leads.map((lead) => ({
    ...lead,
    ...controlDrafts[lead.id],
  }));
  const meta = response?.meta;
  const totalCount = meta?.total ?? 0;
  const totalPages = Math.max(
    1,
    meta?.totalPages ?? Math.ceil(totalCount / pageSize),
  );
  const currentPage = Math.min(page, totalPages);

  const handleLeadResultChange = (id: string, result: LeadResultStatus) => {
    setControlDrafts((previous) => ({
      ...previous,
      [id]: { ...previous[id], result },
    }));
  };

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

  const handleCampaignChange = (value: string) => {
    setCampaign(value);
    setPage(1);
  };

  const resetFilters = () => {
    setQuery("");
    setStatus("all");
    setResolution("all");
    setCampaign("");
    setPage(1);
  };

  const handleCreateLead = async (fields: LeadCreateFields) => {
    await createMutation.mutateAsync(fields);
    setCreateDialogOpen(false);
    setPage(1);
    toast.success("Đã tạo Lead.");
  };

  const runAutomaticAssignment = async () => {
    try {
      const result = await runUnassignedMutation.mutateAsync({});
      await queryClient.invalidateQueries({ queryKey: leadSaleLeadsKeys.all });
      await queryClient.invalidateQueries({
        queryKey: leadAssignmentBatchKeys.all,
      });

      if (!result.batch) {
        toast.info("Không có Lead chưa phân công", {
          description:
            result.message ?? "Tất cả Lead hiện tại đã được xử lý.",
        });
        return;
      }

      toast.success("Đã phân công tự động", {
        description: `${result.batch.summary.assigned} Lead đã được giao cho Sale/CTV; ${result.batch.summary.manualReview} Lead cần rà soát.`,
      });
    } catch (mutationError) {
      toast.error("Không thể phân công tự động", {
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
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 max-sm:w-full">
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
          <Button
            size="md"
            variant="primary"
            appearance="fill"
            onPress={runAutomaticAssignment}
            isDisabled={runUnassignedMutation.isPending}
            aria-label="Phân công tự động các Lead chưa có người phụ trách"
          >
            <Bolt1 size={18} aria-hidden="true" />
            {runUnassignedMutation.isPending
              ? "Đang phân công…"
              : "Phân công tự động"}
          </Button>
        </div>
      </header>

      <LeadListToolbar
        query={query}
        status={status}
        resolution={resolution}
        campaign={campaign}
        campaigns={availableCampaigns}
        campaignLoading={campaignsQuery.isPending}
        campaignError={campaignsQuery.error?.message}
        resultCount={totalCount}
        onQueryChange={handleQueryChange}
        onStatusChange={handleStatusChange}
        onResolutionChange={handleResolutionChange}
        onCampaignChange={handleCampaignChange}
        onReset={resetFilters}
      />

      <Card className="min-w-0 overflow-hidden p-0">
        <div className="lg:overflow-x-auto">
          <div className="lg:min-w-[1350px]">
            <div
              className={`hidden ${leadListGrid} items-center gap-4 border-b border-card-border bg-background-soft-50 px-5 py-3 text-xs font-medium text-text-tertiary lg:grid`}
              aria-hidden="true"
            >
              <span>Họ và Tên</span>
              <span>Di động</span>
              <span>Nguồn</span>
              <span>Người phụ trách</span>
              <span>Trạng thái lead</span>
              <span>Kết quả</span>
              <span>Số lần liên hệ</span>
              <span>Ngày tạo</span>
            </div>
            {isPending && !response ? (
              <div
                className="px-5 py-14 text-center text-sm text-text-tertiary"
                role="status"
              >
                Đang tải danh sách Lead…
              </div>
            ) : (
              <LeadList
                leads={displayedLeads}
                onResultChange={handleLeadResultChange}
              />
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
    </main>
  );
}
