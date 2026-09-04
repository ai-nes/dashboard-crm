import { ArrowRight } from "@tailgrids/icons";
import Link from "next/link";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { funnelStages } from "./data";
import FunnelStageTooltip from "./funnel-stage-tooltip";

export default function FunnelOverview() {
  const firstStage = funnelStages[0]?.value ?? 0;

  return (
    <Card className="min-w-0 p-4 sm:p-5">
      <CardHeader className="items-start">
        <div>
          <CardTitle className="text-base">Phễu tuyển sinh</CardTitle>
          <p className="mt-1 text-[11px] leading-4 text-text-tertiary">Luồng chuyển đổi trong thời gian gần đây.</p>
        </div>
      </CardHeader>

      <div className="mt-4 space-y-3.5" role="list" aria-label="Các bước phễu tuyển sinh">
        {funnelStages.map((stage, index) => {
          const previousValue = funnelStages[index - 1]?.value;
          const conversionRate = previousValue ? Math.round((stage.value / previousValue) * 100) : null;
          const width = `${(stage.value / firstStage) * 100}%`;

          return (
            <div key={stage.id} role="listitem">
              <div className="relative min-h-8 sm:min-h-5">
                <div className="flex items-center gap-2 text-xs font-medium text-text-secondary sm:absolute sm:inset-y-0 sm:left-0 sm:z-10 sm:max-w-[42%] sm:text-sm">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: stage.color }} aria-hidden="true" />
                  <span className="truncate">{stage.label}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-center sm:mt-0">
                  <div className="flex w-full max-w-[26rem] items-center justify-center sm:translate-x-4">
                    <FunnelStageTooltip
                      label={stage.label}
                      value={stage.value}
                      color={stage.color}
                      conversionRate={conversionRate}
                      width={width}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-card-border pt-3">
        <p className="text-[11px] text-text-tertiary">Theo dõi từ lúc phân công đến khi nhập học</p>
        <Link
          href="/sale/students"
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-primary-600 transition-colors hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          Xem chi tiết
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
