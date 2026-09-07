"use client";

import { Plus } from "@tailgrids/icons";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DeleteRecordDialog } from "@/components/common/delete-record-dialog";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";

import CampaignFormDialog from "./campaign-form-dialog";
import CampaignList from "./campaign-list";
import CampaignStats from "./campaign-stats";
import CampaignToolbar from "./campaign-toolbar";
import { initialCampaigns } from "./data";
import type { CampaignListItem, CampaignMode, CampaignStatus, CampaignStatusFilter } from "./types";

type FormDialogState = { mode: "create" } | { mode: "edit"; campaign: CampaignListItem } | null;

const pageSize = 5;

export default function CampaignsOverviewDashboard() {
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>(initialCampaigns);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CampaignStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [formDialog, setFormDialog] = useState<FormDialogState>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<CampaignListItem | null>(null);

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
    setCampaigns((current) =>
      current.map((campaign) => (campaign.id === id ? { ...campaign, status: nextStatus } : campaign)),
    );
    toast.success("Đã cập nhật trạng thái chiến dịch.");
  };

  const handleModeChange = (id: string, nextMode: CampaignMode) => {
    setCampaigns((current) =>
      current.map((campaign) =>
        campaign.id === id ? { ...campaign, mode: nextMode, channelUrl: nextMode === "OFFLINE" ? "" : campaign.channelUrl } : campaign,
      ),
    );
    toast.success("Đã cập nhật hình thức chiến dịch.");
  };

  const handleChannelUrlChange = (id: string, channelUrl: string) => {
    setCampaigns((current) =>
      current.map((campaign) => (campaign.id === id ? { ...campaign, channelUrl } : campaign)),
    );
    toast.success(channelUrl ? "Đã cập nhật liên kết kênh online." : "Đã xóa liên kết kênh online.");
  };

  const handleFormSubmit = (fields: Omit<CampaignListItem, "id">) => {
    if (formDialog?.mode === "edit") {
      const { campaign } = formDialog;
      setCampaigns((current) =>
        current.map((item) => (item.id === campaign.id ? { ...fields, id: campaign.id } : item)),
      );
      toast.success("Đã cập nhật chiến dịch.");
    } else {
      setCampaigns((current) => [{ ...fields, id: `camp-${Date.now()}` }, ...current]);
      toast.success("Đã tạo chiến dịch mới.");
    }
    setFormDialog(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingCampaign) return;
    setCampaigns((current) => current.filter((item) => item.id !== deletingCampaign.id));
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
        onStatusChange={handleStatusChange}
        onModeChange={handleModeChange}
        onChannelUrlChange={handleChannelUrlChange}
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
