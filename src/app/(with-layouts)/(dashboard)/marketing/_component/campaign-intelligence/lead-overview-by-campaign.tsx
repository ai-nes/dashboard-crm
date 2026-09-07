"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer, ChartTooltip } from "@/components/tailgrids/core/chart";
import type { CampaignRecord } from "@/services/api/campaign-intelligence";
import { LeadOverviewTooltip } from "./custom-tooltip";
import { formatNumber } from "./formatters";
import { buildLeadOverview, LEAD_STATUS_GROUPS, type CampaignLeadSelection } from "./lead-overview-model";

interface LeadOverviewProps {
  campaigns: CampaignRecord[];
  onSelect: (selection: CampaignLeadSelection) => void;
  onRetry: () => void;
}

export function LeadOverviewByCampaign({ campaigns, onSelect, onRetry }: LeadOverviewProps) {
  const [limit, setLimit] = useState(5);
  const overview = buildLeadOverview(campaigns, limit);
  const metrics = [
    { label: "Tổng lead", count: overview.total },
    { label: "Đang xử lý", count: overview.groups.in_progress },
    { label: "Chưa kết nối", count: overview.groups.no_response },
    { label: "Đã chuyển đổi", count: overview.groups.converted },
  ];

  return (
    <Card className="min-w-0 p-0">
      <CardHeader className="flex flex-col gap-3 border-b border-card-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Lead theo campaign</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">Click vào biểu đồ để xem danh sách Lead.</p>
        </div>
        <div role="group" aria-label="Số chiến dịch trên biểu đồ" className="flex gap-1">
          {[5, 10].map((value) => (
            <Button key={value} size="xs" appearance={limit === value ? "fill" : "outline"} aria-pressed={limit === value} onPress={() => setLimit(value)}>Top {value}</Button>
          ))}
        </div>
      </CardHeader>
      {!overview.available ? (
        <div role="status" className="p-6 text-sm text-text-secondary">
          <p>Chưa có dữ liệu tổng hợp trạng thái lead cho phạm vi này.</p>
          <Button appearance="outline" size="sm" className="mt-3" onPress={onRetry}>Tải lại</Button>
        </div>
      ) : (
        <div className="space-y-4 p-5">
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <dt className="text-xs text-text-tertiary">{metric.label}</dt>
                <dd className="mt-1 text-2xl font-semibold text-text-primary tabular-nums">{formatNumber(metric.count)}</dd>
              </div>
            ))}
          </dl>
          {overview.total === 0 ? (
            <p role="status" className="py-10 text-center text-sm text-text-secondary">Chưa có lead được ghi nhận trong các chiến dịch thuộc phạm vi này.</p>
          ) : (
            <>
              <ul aria-label="Chú giải trạng thái lead" className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-secondary">
                {LEAD_STATUS_GROUPS.map(({ code, label, color }) => (
                  <li key={code} className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />{label}</li>
                ))}
              </ul>
              <div className="overflow-x-auto">
                <div className="min-w-120" style={{ height: Math.max(240, overview.rows.length * 48 + 40) }}>
                  <ChartContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={overview.rows} margin={{ top: 8, right: 20, left: 0, bottom: 8 }} accessibilityLayer>
                      <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="id" width={145} tickLine={false} axisLine={false} interval={0} tickFormatter={(id: string) => {
                        const name = overview.rows.find((row) => row.id === id)?.name ?? id;
                        return name.length > 21 ? `${name.slice(0, 20)}…` : name;
                      }} />
                      <ChartTooltip content={<LeadOverviewTooltip />} cursor={{ fill: "var(--background-soft-50)" }} />
                      {LEAD_STATUS_GROUPS.map(({ code, label, color }) => (
                        <Bar key={code} dataKey={code} name={label} stackId="leads" fill={color} maxBarSize={28} cursor="pointer" onClick={(_, index) => {
                          const row = overview.rows[index];
                          if (row) onSelect({ campaign: row.campaign, statusGroup: code });
                        }} />
                      ))}
                    </BarChart>
                  </ChartContainer>
                </div>
              </div>
              <p className="text-xs text-text-tertiary">Hiển thị {overview.rows.length}/{campaigns.length} chiến dịch theo tổng lead. Tổng chỉ số phía trên bao gồm tất cả chiến dịch.</p>
              {overview.ungrouped > 0 && <p className="text-xs text-text-tertiary">{formatNumber(overview.ungrouped)} lead chưa thuộc 5 nhóm trên; xem trạng thái gốc trong danh sách lead.</p>}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
