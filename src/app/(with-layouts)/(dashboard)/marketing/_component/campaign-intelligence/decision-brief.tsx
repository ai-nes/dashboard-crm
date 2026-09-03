"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { CampaignIntelligenceResponse } from "@/services/api/campaign-intelligence";
import { toast } from "sonner";
import { formatCurrency } from "./formatters";

export function DecisionBrief({
  recommendation,
}: Pick<CampaignIntelligenceResponse, "recommendation">) {
  return (
    <Card className="h-fit p-0 xl:sticky xl:top-5">
      <CardHeader className="border-b border-card-border px-5 py-4">
        <div>
          <CardTitle>Tóm tắt quyết định</CardTitle>
          <p className="mt-0.5 text-xs text-text-tertiary">
            Đề xuất dựa trên phân bổ nguồn đã đối soát
          </p>
        </div>
        <Badge color="success">Độ tin cậy cao</Badge>
      </CardHeader>
      <div className="space-y-5 p-5">
        <div>
          <p className="text-xs font-medium text-text-tertiary">
            Hành động đề xuất
          </p>
          <h2 className="mt-2 text-lg leading-6 font-semibold tracking-[-0.2px] text-text-primary">
            {recommendation.title}
          </h2>
        </div>
        <div className="border-y border-card-border py-4">
          <p className="text-xs font-medium text-text-tertiary">
            Tác động doanh thu ước tính
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-[-0.3px] text-success-500">
            +{formatCurrency(recommendation.impact)}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            trong 30 ngày tiếp theo
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Evidence</h3>
          <ul className="mt-3 space-y-3">
            {recommendation.evidence.map((item) => (
              <li
                key={item}
                className="flex gap-2 text-sm leading-5 text-text-secondary"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-500"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Button
          className="w-full"
          onPress={() =>
            toast.success("Đã tạo kịch bản tái phân bổ ngân sách.")
          }
        >
          Tạo kịch bản phân bổ
        </Button>
        <p className="text-xs leading-5 text-text-tertiary">
          Khoản thu xác nhận chỉ gồm học sinh đã xác nhận nhập học và đã được
          đối soát trong CRM.
        </p>
      </div>
    </Card>
  );
}
