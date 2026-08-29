import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { CampaignIntelligenceResponse } from "@/services/api/campaign-intelligence";
import { formatNumber } from "./formatters";

const STAGE_BAR_COLORS = [
  "bg-primary-500",
  "bg-primary-500/90",
  "bg-primary-500/80",
  "bg-primary-500/70",
  "bg-primary-500/60",
  "bg-emerald-500/80",
  "bg-emerald-500",
];

export function CampaignFunnel({ funnel }: Pick<CampaignIntelligenceResponse, "funnel">) {
  return (
    <Card className="flex h-full flex-col p-0">
      <CardHeader className="flex flex-row items-center justify-between border-b border-card-border px-5 py-4">
        <div>
          <CardTitle>Full funnel chuyển đổi</CardTitle>
          <p className="mt-0.5 text-xs text-text-tertiary">Conversion qua từng điểm chạm</p>
        </div>
        <Badge color="primary" size="sm">
          {funnel.length} giai đoạn
        </Badge>
      </CardHeader>

      <div className="flex flex-1 flex-col justify-between gap-3 p-5">
        {funnel.map((stage, index) => {
          const barWidthPercent = 100 - index * 11.5;
          const isFinalStage = index === funnel.length - 1;

          return (
            <div key={stage.label} className="group flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium text-text-primary">
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-background-soft-100 text-[10px] font-semibold text-text-tertiary">
                    {index + 1}
                  </span>
                  <span>{stage.label}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="font-semibold tabular-nums text-text-primary">
                    {formatNumber(stage.count)}
                  </span>
                  {stage.conversionRate !== undefined ? (
                    <span
                      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums ${
                        isFinalStage
                          ? "bg-badge-success-background text-badge-success-text"
                          : "bg-background-soft-100 text-text-secondary"
                      }`}
                    >
                      {stage.conversionRate}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-background-soft-100 px-1.5 py-0.5 text-[11px] font-medium text-text-tertiary">
                      100%
                    </span>
                  )}
                </div>
              </div>

              {/* Funnel Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-background-soft-100 dark:bg-background-soft-200">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    STAGE_BAR_COLORS[index] ?? "bg-primary-500"
                  }`}
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

