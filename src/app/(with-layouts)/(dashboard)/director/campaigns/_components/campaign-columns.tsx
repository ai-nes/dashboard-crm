import type { ColumnDef } from "@tanstack/react-table";
import { Pencil1, Trash1 } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { formatDate } from "@/utils/format-date";

import CampaignChannelCell from "./campaign-channel-cell";
import { campaignModeLabel, campaignModeOptions, campaignStatusLabel, campaignStatusOptions } from "./mappings";
import type { CampaignListItem, CampaignMode, CampaignStatus } from "./types";

const statusTriggerClass: Record<CampaignStatus, string> = {
  DRAFT: "border-transparent bg-badge-gray-background text-badge-gray-text",
  UPCOMING: "border-transparent bg-badge-sky-background text-badge-sky-text",
  ACTIVE: "border-transparent bg-badge-success-background text-badge-success-text",
  CLOSED: "border-transparent bg-badge-warning-background text-badge-warning-text",
};

const modeTriggerClass: Record<CampaignMode, string> = {
  ONLINE: "border-transparent bg-badge-sky-background text-badge-sky-text",
  OFFLINE: "border-transparent bg-badge-gray-background text-badge-gray-text",
  HYBRID: "border-transparent bg-badge-violet-background text-badge-violet-text",
};

interface CampaignColumnHandlers {
  onStatusChange: (id: string, status: CampaignStatus) => void;
  onModeChange: (id: string, mode: CampaignMode) => void;
  onChannelUrlChange: (id: string, channelUrl: string) => void;
  onEdit: (campaign: CampaignListItem) => void;
  onDelete: (campaign: CampaignListItem) => void;
}

export function campaignColumns({
  onStatusChange,
  onModeChange,
  onChannelUrlChange,
  onEdit,
  onDelete,
}: CampaignColumnHandlers): ColumnDef<CampaignListItem>[] {
  return [
    {
      accessorKey: "code",
      header: "Mã chiến dịch",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-text-primary">{row.original.code}</span>
      ),
    },
    {
      accessorKey: "name",
      header: "Tên chiến dịch",
      cell: ({ row }) => <span className="font-medium text-text-primary">{row.original.name}</span>,
    },
    {
      id: "duration",
      header: "Thời gian",
      cell: ({ row }) => (
        <span className="tabular-nums text-text-secondary">
          {formatDate(row.original.startDate)} – {formatDate(row.original.endDate)}
        </span>
      ),
    },
    {
      accessorKey: "mode",
      header: "Hình thức",
      cell: ({ row }) => {
        const campaign = row.original;
        return (
          <Select
            value={campaign.mode}
            onChange={(value) => onModeChange(campaign.id, String(value) as CampaignMode)}
            aria-label={`Đổi hình thức ${campaign.name}`}
            className="w-fit min-w-32"
          >
            <SelectTrigger size="sm" className={`w-full ${modeTriggerClass[campaign.mode]}`}>
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              {campaignModeOptions.map((mode) => (
                <SelectItem key={mode} id={mode} textValue={campaignModeLabel[mode]}>
                  {campaignModeLabel[mode]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      id: "channelUrl",
      header: "Kênh online",
      cell: ({ row }) => {
        const campaign = row.original;
        return (
          <CampaignChannelCell
            campaignName={campaign.name}
            channelUrl={campaign.channelUrl}
            onChange={(url) => onChannelUrlChange(campaign.id, url)}
          />
        );
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const campaign = row.original;
        return (
          <Select
            value={campaign.status}
            onChange={(value) => onStatusChange(campaign.id, String(value) as CampaignStatus)}
            aria-label={`Đổi trạng thái ${campaign.name}`}
            className="w-fit min-w-40"
          >
            <SelectTrigger size="sm" className={`w-full ${statusTriggerClass[campaign.status]}`}>
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              {campaignStatusOptions.map((status) => (
                <SelectItem key={status} id={status} textValue={campaignStatusLabel[status]}>
                  {campaignStatusLabel[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const campaign = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              appearance="ghost"
              size="sm"
              iconOnly
              aria-label={`Sửa ${campaign.name}`}
              className="text-text-tertiary"
              onPress={() => onEdit(campaign)}
            >
              <Pencil1 size={15} aria-hidden="true" />
            </Button>
            <Button
              appearance="ghost"
              size="sm"
              iconOnly
              variant="danger"
              aria-label={`Xóa ${campaign.name}`}
              onPress={() => onDelete(campaign)}
            >
              <Trash1 size={15} aria-hidden="true" />
            </Button>
          </div>
        );
      },
    },
  ];
}
