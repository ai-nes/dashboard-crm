"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Sparkle, TrendUp2 } from "@tailgrids/icons";
import type { CampaignIntelligenceResponse } from "@/services/api/campaign-intelligence";
import { toast } from "sonner";
import { formatCompactCurrency } from "./formatters";

export function RecommendationBanner({ recommendation }: Pick<CampaignIntelligenceResponse, "recommendation">) {
  return (
    <section
      aria-label="Khuyến nghị phân bổ ngân sách"
      className="relative overflow-hidden rounded-xl border border-primary-500/20 bg-gradient-to-r from-primary-500/5 via-card-background to-card-background p-5"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white-100 shadow-sm shadow-primary-500/20">
            <Sparkle size={20} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                Khuyến nghị AI
              </span>
              <Badge color="success" size="sm">
                Độ tin cậy: Cao
              </Badge>
              {recommendation.impact > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-badge-success-background px-2 py-0.5 text-xs font-semibold text-badge-success-text">
                  <TrendUp2 size={13} />
                  +{formatCompactCurrency(recommendation.impact)} ước tính
                </span>
              )}
            </div>

            <h2 className="mt-1 text-base font-bold text-text-primary sm:text-lg">
              {recommendation.title}
            </h2>

            <p className="mt-1 text-xs text-text-secondary">
              Dựa trên phân tích đối soát doanh thu thực tế và chỉ số ROAS giữa các kênh.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Button
            variant="primary"
            appearance="fill"
            size="md"
            onPress={() => toast.success("Đã tạo kịch bản tái phân bổ ngân sách tối ưu.")}
            className="w-full sm:w-auto"
          >
            Tạo kịch bản tối ưu
          </Button>
        </div>
      </div>
    </section>
  );
}

