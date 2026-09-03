"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import type { CampaignRecord } from "@/services/api/campaign-intelligence";
import { formatCompactCurrency, formatNumber } from "./formatters";
import { PlatformIcon } from "./icons";

const healthConfig = {
  on_track: { label: "Hiệu quả", color: "success" as const },
  watch: { label: "Theo dõi", color: "warning" as const },
  reallocate: { label: "Tái phân bổ", color: "error" as const },
};

export function CampaignTable({ campaigns }: { campaigns: CampaignRecord[] }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <CardHeader className="flex flex-row items-center justify-between border-b border-card-border px-5 py-4">
        <div>
          <CardTitle>Hiệu quả theo chiến dịch</CardTitle>
          <p className="mt-0.5 text-xs text-text-tertiary">
            Doanh thu xác nhận và hiệu quả phân bổ
          </p>
        </div>
        <span className="text-xs font-medium text-text-tertiary">
          {campaigns.length} chiến dịch
        </span>
      </CardHeader>

      <div className="flex flex-1 flex-col overflow-x-auto">
        <TableRoot className="h-full w-full rounded-none border-none">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-3.5 text-left">
                Kênh / Chiến dịch
              </TableHead>
              <TableHead className="px-3 py-3.5 text-right">Chi phí</TableHead>
              <TableHead className="px-3 py-3.5 text-right">
                Đủ điều kiện
              </TableHead>
              <TableHead className="px-3 py-3.5 text-right">Nhập học</TableHead>
              <TableHead className="px-3 py-3.5 text-right">
                Doanh thu
              </TableHead>
              <TableHead className="px-3 py-3.5 text-right">ROAS</TableHead>
              <TableHead className="px-4 py-3.5 text-center">
                Trạng thái
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => {
              const status = healthConfig[campaign.health];
              return (
                <TableRow
                  key={campaign.id}
                  className="transition-colors hover:bg-background-soft-50 dark:hover:bg-background-soft-100"
                >
                  <TableCell className="px-4 py-4.5">
                    <div className="flex items-center gap-3">
                      <PlatformIcon channel={campaign.channel} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-text-primary">
                          {campaign.channel}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-text-tertiary">
                          {campaign.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-4.5 text-right font-medium tabular-nums whitespace-nowrap text-text-secondary">
                    {formatCompactCurrency(campaign.spend)}
                  </TableCell>
                  <TableCell className="px-3 py-4.5 text-right font-medium tabular-nums whitespace-nowrap text-text-secondary">
                    {formatNumber(campaign.qualifiedLeads)}
                  </TableCell>
                  <TableCell className="px-3 py-4.5 text-right font-medium tabular-nums whitespace-nowrap text-text-secondary">
                    {formatNumber(campaign.enrollments)}
                  </TableCell>
                  <TableCell className="px-3 py-4.5 text-right font-semibold tabular-nums whitespace-nowrap text-text-primary">
                    {formatCompactCurrency(campaign.confirmedRevenue)}
                  </TableCell>
                  <TableCell className="px-3 py-4.5 text-right tabular-nums whitespace-nowrap">
                    <span
                      className={`inline-block font-semibold ${
                        campaign.roas >= 3
                          ? "text-success-500"
                          : campaign.roas >= 1.5
                            ? "text-text-primary"
                            : "text-error-500"
                      }`}
                    >
                      {campaign.roas.toFixed(2)}x
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-4.5 text-center whitespace-nowrap">
                    <Badge
                      color={status.color}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      {status.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </TableRoot>
      </div>
    </Card>
  );
}
