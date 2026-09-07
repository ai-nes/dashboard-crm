"use client";

import { Plus } from "@tailgrids/icons";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { DeleteRecordDialog } from "@/components/common/delete-record-dialog";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  useLeadSaleCampaignChannelTypesQuery,
  useCreateLeadSaleCampaignMutation,
  useLeadSaleCampaignsQuery,
  useUpdateLeadSaleCampaignMutation,
} from "@/hooks/use-lead-sale-campaign-queries";
import CampaignFormDialog from "./campaign-form-dialog";
import CampaignList from "./campaign-list";
import CampaignStats from "./campaign-stats";
import CampaignToolbar from "./campaign-toolbar";
import { isChannelTypeValidForMode, type ChannelTypeValue } from "./channel-types";
import { toCampaignListItem } from "./campaign-mappers";
import type {
  CampaignFormValues,
  CampaignListItem,
  CampaignMode,
  CampaignStatus,
  CampaignStatusFilter,
} from "./types";

type FormDialogState = { mode: "create" } | { mode: "edit"; campaign: CampaignListItem } | null;

const pageSize = 5;

export default function CampaignsOverviewDashboard() {
  const { data, error } = useLeadSaleCampaignsQuery();
  const {
    data: channelTypeData,
    error: channelTypeError,
  } = useLeadSaleCampaignChannelTypesQuery();
  const channelTypes = channelTypeData?.channelTypes ?? [];
  const createCampaignMutation = useCreateLeadSaleCampaignMutation();
  const updateCampaignMutation = useUpdateLeadSaleCampaignMutation();
  const [campaignChanges, setCampaignChanges] = useState<Record<string, Partial<CampaignListItem>>>({});
  const [deletedCampaignIds, setDeletedCampaignIds] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CampaignStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [formDialog, setFormDialog] = useState<FormDialogState>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<CampaignListItem | null>(null);

  useEffect(() => {
    if (error) toast.error(error.message || "Không thể tải danh sách chiến dịch.");
  }, [error]);

  useEffect(() => {
    if (channelTypeError) {
      toast.error(channelTypeError.message || "Không thể tải danh sách loại kênh.");
    }
  }, [channelTypeError]);

  const campaigns = useMemo(() => {
    const liveCampaigns = (data?.campaigns ?? []).map(toCampaignListItem);
    return liveCampaigns
      .filter((campaign) => !deletedCampaignIds.has(campaign.id))
      .map((campaign) => ({ ...campaign, ...campaignChanges[campaign.id] }));
  }, [campaignChanges, data, deletedCampaignIds]);

  const filteredCampaigns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      const matchesQuery =
        !normalizedQuery ||
        campaign.code.toLowerCase().includes(normalizedQuery) ||
        campaign.name.toLowerCase().includes(normalizedQuery);
      const matchesStatus = status === "all" || campaign.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [campaigns, query, status]);

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageCampaigns = filteredCampaigns.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: CampaignStatusFilter) => {
    setStatus(value);
    setPage(1);
  };

  const counts = useMemo<Record<CampaignStatusFilter, number>>(
    () => ({
      all: campaigns.length,
      DRAFT: campaigns.filter((item) => item.status === "DRAFT").length,
      UPCOMING: campaigns.filter((item) => item.status === "UPCOMING").length,
      ACTIVE: campaigns.filter((item) => item.status === "ACTIVE").length,
      CLOSED: campaigns.filter((item) => item.status === "CLOSED").length,
    }),
    [campaigns],
  );

  const handleStatusChange = (id: string, nextStatus: CampaignStatus) => {
    setCampaignChanges((current) => ({ ...current, [id]: { ...current[id], status: nextStatus } }));
    toast.success("Đã cập nhật trạng thái chiến dịch.");
  };

  const handleModeChange = (id: string, nextMode: CampaignMode) => {
    const campaign = campaigns.find((item) => item.id === id);
    const channelType = campaign?.channelType ?? "";
    setCampaignChanges((current) => ({
      ...current,
      [id]: {
        ...current[id],
        mode: nextMode,
        channelType: isChannelTypeValidForMode(channelType, nextMode, channelTypes)
          ? channelType
          : "",
      },
    }));
    toast.success("Đã cập nhật hình thức chiến dịch.");
  };

  const handleChannelSave = async (
    id: string,
    channelType: ChannelTypeValue | "",
    channelUrl: string,
  ) => {
    const campaign = campaigns.find((item) => item.id === id);
    if (!campaign) return;
    await updateCampaignMutation.mutateAsync({
      name: id,
      channelType,
      channelUrl,
    });
    setCampaignChanges((current) => ({
      ...current,
      [id]: { ...current[id], channelType, channelUrl },
    }));
    toast.success("Đã cập nhật thông tin kênh.");
  };

  const handleFormSubmit = async (fields: CampaignFormValues) => {
    if (formDialog?.mode === "edit") {
      const { campaign } = formDialog;
      await updateCampaignMutation.mutateAsync({
        name: campaign.id,
        title: fields.name.trim(),
        status: fields.status,
        startDate: fields.startDate,
        endDate: fields.endDate,
        channelBoundary: fields.mode === "ONLINE" ? "Digital" : "Field",
        channelType: fields.channelType,
        channelUrl: fields.channelUrl.trim(),
      });
      setCampaignChanges((current) => {
        const next = { ...current };
        delete next[campaign.id];
        return next;
      });
      toast.success("Đã cập nhật chiến dịch.");
    } else {
      const campus = data?.campaigns.find((item) => item.campus)?.campus;
      if (!campus) {
        throw new Error("Không thể tạo chiến dịch vì chưa xác định được cơ sở.");
      }
      await createCampaignMutation.mutateAsync({
        title: fields.name.trim(),
        campus,
        status: fields.status,
        startDate: fields.startDate,
        endDate: fields.endDate,
        channelBoundary: fields.mode === "ONLINE" ? "Digital" : "Field",
        channelType: fields.channelType || undefined,
        channelUrl: fields.channelUrl.trim() || undefined,
      });
      toast.success("Đã tạo chiến dịch mới.");
    }
    setFormDialog(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingCampaign) return;
    setDeletedCampaignIds((current) => new Set(current).add(deletingCampaign.id));
    toast.success("Đã xóa chiến dịch.");
    setDeletingCampaign(null);
  };

  return (
    <main id="main-content" className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <header className="flex flex-col gap-5 rounded-xl border border-card-border bg-card-background p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="primary">FAIP · Chiến dịch tuyển sinh</Badge>
          </div>
          <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
            Quản lý chiến dịch tuyển sinh
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            Theo dõi các kỳ tuyển sinh, thời gian mở/đóng và trạng thái vận hành.
          </p>
        </div>
        <Button className="shrink-0 self-start lg:self-auto" onPress={() => setFormDialog({ mode: "create" })}>
          <Plus size={16} aria-hidden="true" />
          Tạo chiến dịch
        </Button>
      </header>

      <CampaignStats campaigns={campaigns} />

      <CampaignList
        campaigns={pageCampaigns}
        channelTypes={channelTypes}
        onStatusChange={handleStatusChange}
        onModeChange={handleModeChange}
        onChannelSave={handleChannelSave}
        onEdit={(campaign) => setFormDialog({ mode: "edit", campaign })}
        onDelete={setDeletingCampaign}
        toolbar={
          <CampaignToolbar
            query={query}
            onQueryChange={handleQueryChange}
            status={status}
            onStatusChange={handleStatusFilterChange}
            counts={counts}
          />
        }
        pagination={{ page: currentPage, totalPages, total: filteredCampaigns.length, pageSize }}
        onPageChange={(nextPage) => setPage(Math.min(Math.max(1, nextPage), totalPages))}
      />

      {formDialog && (
        <CampaignFormDialog
          campaign={formDialog.mode === "edit" ? formDialog.campaign : null}
          channelTypes={channelTypes}
          onClose={() => setFormDialog(null)}
          onSubmit={handleFormSubmit}
        />
      )}

      <DeleteRecordDialog
        isOpen={Boolean(deletingCampaign)}
        recordType="chiến dịch"
        recordName={deletingCampaign?.name ?? ""}
        onOpenChange={(open) => !open && setDeletingCampaign(null)}
        onConfirm={handleDeleteConfirm}
      />
    </main>
  );
}
