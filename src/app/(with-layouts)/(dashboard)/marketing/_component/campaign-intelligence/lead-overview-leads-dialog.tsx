"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/tailgrids/core/badge";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Button } from "@/components/tailgrids/core/button";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { useCampaignLeadsQuery } from "@/hooks/use-campaign-intelligence-queries";
import type { LeadStatusFilter } from "@/services/api/campaign-intelligence";
import { formatNumber } from "./formatters";
import {
  LEAD_QUALITY_GROUPS,
  LEAD_STATUS_GROUPS,
  type CampaignLeadSelection,
} from "./lead-overview-model";

const PAGE_SIZE = 20;

const statusColor = {
  new: "blue",
  in_progress: "primary",
  no_response: "warning",
  disqualified: "error",
  converted: "success",
  invalid: "error",
  duplicate: "warning",
  unknown: "gray",
} as const;

interface LeadOverviewLeadsDialogProps {
  selection: CampaignLeadSelection;
  onClose: () => void;
}

export function LeadOverviewLeadsDialog({
  selection,
  onClose,
}: LeadOverviewLeadsDialogProps) {
  const [page, setPage] = useState(1);
  const [statusGroup, setStatusGroup] = useState<LeadStatusFilter>(
    selection.statusGroup ?? "all",
  );
  const query = useCampaignLeadsQuery({
    campaignId: selection.campaign.id,
    statusGroup,
    page,
    pageSize: PAGE_SIZE,
  });
  const pagination = query.data?.pagination;

  function changeStatus(next: LeadStatusFilter) {
    setStatusGroup(next);
    setPage(1);
  }

  return (
    <Backdrop isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog
        aria-label={`Danh sách lead của ${selection.campaign.name}`}
        className="flex max-h-[min(48rem,calc(100vh-2rem))] max-w-5xl flex-col overflow-hidden p-0 max-sm:max-w-[calc(100%-1rem)]"
      >
        <DialogHeader className="shrink-0 border-b border-card-border px-5 py-5 pr-14">
          <p className="text-xs font-semibold text-primary-600 dark:text-primary-300">
            Lead theo chiến dịch
          </p>
          <DialogTitle className="mt-1 text-xl leading-7">
            {selection.campaign.name}
          </DialogTitle>
          <p className="mt-1 text-sm text-text-secondary">
            {selection.campaign.channel} · {selection.campaign.leadCount === null ? "Chưa có tổng Lead" : `${formatNumber(selection.campaign.leadCount)} lead`}
          </p>
        </DialogHeader>

        <DialogBody className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-4">
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Lọc trạng thái lead"
            >
              <StatusFilter
                label="Tất cả"
                active={statusGroup === "all"}
                onPress={() => changeStatus("all")}
              />
              {LEAD_STATUS_GROUPS.map(({ code, label }) => (
                <StatusFilter
                  key={code}
                  label={label}
                  active={statusGroup === code}
                  onPress={() => changeStatus(code)}
                />
              ))}
              {LEAD_QUALITY_GROUPS.map(({ code, label }) => (
                <StatusFilter
                  key={code}
                  label={label}
                  active={statusGroup === code}
                  onPress={() => changeStatus(code)}
                />
              ))}
            </div>

            {query.isLoading && <p role="status" className="py-12 text-center text-sm text-text-secondary">Đang tải danh sách lead…</p>}
            {query.isError && (
              <div role="alert" className="rounded-lg border border-card-border p-6 text-center">
                <p className="text-sm text-text-secondary">Không thể tải danh sách lead.</p>
                <Button className="mt-3" appearance="outline" size="sm" onPress={() => void query.refetch()}>Thử lại</Button>
              </div>
            )}
            {query.data && query.data.items.length === 0 && (
              <p role="status" className="py-12 text-center text-sm text-text-secondary">Không có lead trong bộ lọc này.</p>
            )}
            {query.data && query.data.items.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-card-border">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-card-border bg-background-soft-50 text-xs text-text-tertiary">
                    <tr>
                      <th className="px-3 py-3 font-medium">Lead</th>
                      <th className="px-3 py-3 font-medium">Trường</th>
                      <th className="px-3 py-3 font-medium">Trạng thái</th>
                      <th className="px-3 py-3 font-medium">Owner</th>
                      <th className="px-3 py-3 text-right font-medium">Liên hệ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {query.data.items.map((lead) => (
                      <tr key={lead.leadCode} className="border-b border-card-border last:border-0">
                        <td className="px-3 py-3">
                          <Link
                            href={`/director/leads/${encodeURIComponent(lead.id ?? lead.leadCode)}`}
                            className="font-medium text-text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-primary-500"
                          >
                            {lead.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-text-tertiary">{lead.leadCode}</p>
                        </td>
                        <td className="px-3 py-3 text-text-secondary">{lead.school || "—"}</td>
                        <td className="px-3 py-3">
                          <Badge color={statusColor[lead.statusGroup === "all" ? "unknown" : lead.statusGroup]} size="sm">{lead.status || "Chưa có trạng thái"}</Badge>
                        </td>
                        <td className="px-3 py-3 text-text-secondary">{lead.owner || "—"}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-text-secondary">{lead.contactAttemptCount ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogBody>

        <DialogFooter className="shrink-0 border-t border-card-border px-5 py-4 sm:justify-between">
          <p className="text-xs text-text-tertiary">
            {pagination ? `Hiển thị trang ${pagination.page}/${Math.max(pagination.totalPages, 1)} · ${formatNumber(pagination.total)} lead` : ""}
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button
              appearance="outline"
              size="sm"
              isDisabled={!pagination || page <= 1 || query.isFetching}
              onPress={() => setPage((current) => current - 1)}
            >
              Trước
            </Button>
            <Button
              appearance="outline"
              size="sm"
              isDisabled={!pagination || page >= pagination.totalPages || query.isFetching}
              onPress={() => setPage((current) => current + 1)}
            >
              Sau
            </Button>
            <DialogClose appearance="outline" size="sm">Đóng</DialogClose>
          </div>
        </DialogFooter>
      </Dialog>
    </Backdrop>
  );
}

function StatusFilter({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      size="xs"
      appearance={active ? "fill" : "outline"}
      aria-pressed={active}
      onPress={onPress}
    >
      {label}
    </Button>
  );
}
