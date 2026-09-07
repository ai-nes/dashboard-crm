"use client";

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Pencil1, Search1, Trash1 } from "@tailgrids/icons";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { formatDate } from "@/utils/format-date";

import CampaignChannelCell from "./campaign-channel-cell";
import { campaignColumns } from "./campaign-columns";
import type { ChannelTypeValue } from "./channel-types";
import { campaignModeColor, campaignModeLabel, campaignStatusColor, campaignStatusLabel } from "./mappings";
import type { CampaignListItem, CampaignMode, CampaignStatus } from "./types";

interface CampaignListPagination {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

interface CampaignListProps {
  campaigns: CampaignListItem[];
  onStatusChange: (id: string, status: CampaignStatus) => void;
  onModeChange: (id: string, mode: CampaignMode) => void;
  onChannelTypeChange: (id: string, channelType: ChannelTypeValue | "") => void;
  onChannelUrlChange: (id: string, channelUrl: string) => void;
  onEdit: (campaign: CampaignListItem) => void;
  onDelete: (campaign: CampaignListItem) => void;
  toolbar: ReactNode;
  pagination: CampaignListPagination;
  onPageChange: (page: number) => void;
}

export default function CampaignList({
  campaigns,
  onStatusChange,
  onModeChange,
  onChannelTypeChange,
  onChannelUrlChange,
  onEdit,
  onDelete,
  toolbar,
  pagination,
  onPageChange,
}: CampaignListProps) {
  const table = useReactTable({
    data: campaigns,
    columns: campaignColumns({ onStatusChange, onModeChange, onChannelTypeChange, onChannelUrlChange, onEdit, onDelete }),
    getCoreRowModel: getCoreRowModel(),
    getRowId: (campaign) => campaign.id,
  });
  const rows = table.getRowModel().rows;
  const { page, totalPages, total, pageSize } = pagination;

  return (
    <div className="space-y-4">
      {toolbar}

      <Card className="overflow-hidden p-0">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1200px] table-fixed text-left text-sm">
            <caption className="sr-only">Danh sách chiến dịch tuyển sinh</caption>
            <colgroup>
              <col className="w-[130px]" />
              <col className="w-[240px]" />
              <col className="w-[190px]" />
              <col className="w-[150px]" />
              <col className="w-[220px]" />
              <col className="w-[170px]" />
              <col className="w-[110px]" />
            </colgroup>
            <thead className="border-y border-card-border bg-background-gray-secondary/60 text-xs text-text-tertiary">
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  {group.headers.map((header) => (
                    <th key={header.id} scope="col" className="px-4 py-3 font-medium whitespace-nowrap first:pl-5">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-card-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 align-middle first:pl-5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-card-border lg:hidden">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-xs font-semibold text-text-primary">{campaign.code}</p>
                <Badge color={campaignStatusColor[campaign.status]}>{campaignStatusLabel[campaign.status]}</Badge>
              </div>
              <Link
                href={`/lead-sale/campaigns/${campaign.id}`}
                className="mt-1.5 block text-sm font-semibold text-text-primary underline-offset-4 hover:text-primary-600 hover:underline"
              >
                {campaign.name}
              </Link>
              <p className="mt-1 text-xs text-text-tertiary">
                {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <Badge color={campaignModeColor[campaign.mode]}>{campaignModeLabel[campaign.mode]}</Badge>
                <CampaignChannelCell
                  campaignName={campaign.name}
                  mode={campaign.mode}
                  channelType={campaign.channelType}
                  channelUrl={campaign.channelUrl}
                  onChannelTypeChange={(channelType) => onChannelTypeChange(campaign.id, channelType)}
                  onChannelUrlChange={(url) => onChannelUrlChange(campaign.id, url)}
                />
              </div>
              <div className="mt-3 flex items-center justify-end gap-2 border-t border-card-border/60 pt-2.5">
                <Button appearance="ghost" size="sm" className="text-text-secondary" onPress={() => onEdit(campaign)}>
                  <Pencil1 size={14} aria-hidden="true" />
                  Sửa
                </Button>
                <Button appearance="ghost" size="sm" variant="danger" onPress={() => onDelete(campaign)}>
                  <Trash1 size={14} aria-hidden="true" />
                  Xóa
                </Button>
              </div>
            </div>
          ))}
        </div>

        {!campaigns.length && (
          <div className="px-5 py-10 text-center">
            <Search1 size={24} className="mx-auto text-text-tertiary" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-text-primary">Không có chiến dịch phù hợp</p>
            <p className="mt-1 text-xs text-text-tertiary">Thử đổi từ khóa hoặc bộ lọc trạng thái.</p>
          </div>
        )}

        {total > 0 && (
          <div className="flex flex-col gap-3 border-t border-card-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="shrink-0 whitespace-nowrap text-xs text-text-secondary">
              Hiển thị{" "}
              <span className="font-semibold text-text-primary">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
              </span>{" "}
              trong tổng số <span className="font-semibold text-text-primary">{total}</span> chiến dịch
            </p>
            <div className="flex shrink-0 items-center justify-end max-sm:w-full">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} variant="compact" />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
