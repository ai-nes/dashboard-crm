import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tailgrids/core/tooltip";
import type { SalePipelineHealth } from "@/services/api/sale";

interface PipelineHealthProps {
  data: SalePipelineHealth;
}

function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value)}%`;
}

export default function PipelineHealth({ data }: PipelineHealthProps) {
  const agingTotal = data.agingBuckets.reduce((sum, bucket) => sum + bucket.count, 0);
  const hasRisk = data.overdue > 0 || data.noActivity > 0;

  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Rủi ro hồ sơ</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Việc quá hạn, hồ sơ chưa có hoạt động hoặc lưu lâu ở một giai đoạn.</p>
        </div>
        <Badge color={hasRisk ? "warning" : "success"} size="sm">
          {hasRisk ? "Cần theo dõi" : "Ổn định"}
        </Badge>
      </CardHeader>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-1" aria-label="Tín hiệu rủi ro pipeline">
          <div className="rounded-xl border border-card-border bg-background-soft-50 px-3.5 py-3">
            <p className="text-xs font-medium text-text-tertiary">Việc quá hạn</p>
            <p className={`mt-1 text-2xl font-semibold tracking-[-0.5px] ${data.overdue > 0 ? "text-badge-error-text" : "text-text-primary"}`}>
              {data.overdue}<span className="ml-1 text-xs font-medium text-text-tertiary">việc</span>
            </p>
          </div>
          <div className="rounded-xl border border-card-border bg-background-soft-50 px-3.5 py-3">
            <p className="text-xs font-medium text-text-tertiary">Chưa có hoạt động</p>
            <p className={`mt-1 text-2xl font-semibold tracking-[-0.5px] ${data.noActivity > 0 ? "text-warning-600" : "text-text-primary"}`}>
              {data.noActivity}<span className="ml-1 text-xs font-medium text-text-tertiary">hồ sơ</span>
            </p>
          </div>
        </div>

        <div className="border-t border-card-border pt-4 md:border-l md:border-t-0 md:pt-0 md:pl-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-text-primary">Thời gian ở giai đoạn hiện tại</h3>
            <span className="text-[11px] text-text-tertiary">{agingTotal} hồ sơ có phân nhóm</span>
          </div>
          {agingTotal > 0 ? (
            <div className="mt-4 space-y-3" role="list" aria-label="Phân bổ thời gian ở giai đoạn hiện tại">
              {data.agingBuckets.map((bucket) => {
                const share = (bucket.count / agingTotal) * 100;
                const label = `${bucket.label}: ${bucket.count} hồ sơ, ${formatPercent(share)} trong nhóm được phân loại`;

                return (
                  <div key={bucket.id} role="listitem">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="truncate text-text-secondary">{bucket.label}</span>
                      <span className="shrink-0 font-semibold text-text-primary">{bucket.count}</span>
                    </div>
                    <Tooltip placement="top">
                      <TooltipTrigger asChild>
                        <div
                          className="mt-1.5 h-2.5 w-full cursor-help overflow-hidden rounded-full bg-background-soft-100 outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                          role="img"
                          aria-label={label}
                          title={label}
                          tabIndex={0}
                        >
                          <div
                            className="h-full rounded-full bg-primary-500 transition-[width]"
                            style={{ width: `${share}%` }}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="normal-case">
                        <p className="font-semibold">{bucket.label}</p>
                        <p className="mt-0.5 font-normal">{bucket.count} hồ sơ · {formatPercent(share)} trong nhóm được phân loại</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-xs text-text-tertiary">Chưa có dữ liệu thời gian theo giai đoạn.</p>
          )}
          <p className="mt-3 text-[11px] leading-4 text-text-tertiary">Tỷ lệ thanh được tính trên tổng hồ sơ có phân nhóm ở trên.</p>
        </div>
      </div>
    </Card>
  );
}
