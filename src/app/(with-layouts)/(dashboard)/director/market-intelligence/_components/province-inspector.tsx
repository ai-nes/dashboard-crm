"use client";

import { useState } from "react";
import { ArrowRight, ArrowUpward } from "@tailgrids/icons";
import { Button } from "@/components/tailgrids/core/button";
import {
  formatMetricValue,
  getOpportunityBadgeVariant,
  opportunityLabel,
  REGION_CONFIGS,
} from "./data";
import type { ProvinceMetrics } from "./types";

interface ProvinceInspectorProps {
  province: ProvinceMetrics | null;
  onSelectProvince?: (code: string) => void;
}

export default function ProvinceInspector({
  province,
}: ProvinceInspectorProps) {
  const [activeTab, setActiveTab] = useState<"insight" | "schools">("insight");

  if (!province) {
    return (
      <div className="flex h-full min-w-0 flex-col items-center justify-center rounded-2xl bg-card-background p-6 text-center">
        <span className="text-3xl">🗺️</span>
        <h3 className="mt-3 text-sm font-semibold text-text-primary">
          Chưa chọn địa bàn
        </h3>
        <p className="mt-1 text-xs text-text-secondary">
          Nhấp vào một tỉnh/thành trên bản đồ để xem phân tích 360°.
        </p>
      </div>
    );
  }

  const badgeVariant = getOpportunityBadgeVariant(province.opportunity);
  const regionLabel = REGION_CONFIGS[province.regionKey]?.label ?? province.regionKey;

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl bg-card-background p-3.5 sm:p-4">
      {/* 1. Header with Metadata */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-brand-500">
            MÃ: {province.code}
          </span>
          <span className="text-xs text-text-tertiary">
            • {new Intl.NumberFormat("vi-VN").format(province.grade12Population)} HS Lớp 12
          </span>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            badgeVariant === "success"
              ? "bg-emerald-500/10 text-emerald-500"
              : badgeVariant === "primary"
                ? "bg-blue-500/10 text-blue-500"
                : badgeVariant === "warning"
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-rose-500/10 text-rose-500"
          }`}
        >
          {opportunityLabel(province.opportunity)}
        </span>
      </div>

      <div className="mt-1 flex items-baseline justify-between gap-2">
        <h2 className="truncate text-2xl font-bold tracking-tight text-text-primary">
          {province.name}
        </h2>
        <span className="text-xs font-medium text-text-secondary">{regionLabel}</span>
      </div>

      {/* 2. Hero Opportunity Score Bar */}
      <div className="mt-2 rounded-xl bg-background-gray-primary/60 p-2.5 sm:p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-text-secondary">Chỉ số tiềm năng</span>
          <span className="flex items-center gap-1 text-xs font-bold text-success-500">
            +{province.trend}% YoY <ArrowUpward size={11} />
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-text-primary">
            {province.opportunity}
          </span>
          <span className="text-xs font-bold text-text-tertiary">/100 điểm</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background-gray-primary">
          <div
            className="h-full rounded-full bg-linear-to-r from-brand-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${province.opportunity}%` }}
          />
        </div>
      </div>

      {/* 3. Four Core Pillars Grid */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-background-gray-primary/60 p-2.5">
          <span className="text-xs text-text-tertiary">Leads tiếp cận</span>
          <p className="mt-0.5 text-base font-bold text-text-primary">
            {formatMetricValue(province, "leads")}
          </p>
          <span className="text-[11px] text-text-tertiary">
            Thâm nhập {province.penetrationRate}%
          </span>
        </div>

        <div className="rounded-xl bg-background-gray-primary/60 p-2.5">
          <span className="text-xs text-text-tertiary">Tỷ lệ chuyển đổi</span>
          <p className="mt-0.5 text-base font-bold text-success-500">
            {formatMetricValue(province, "conversion")}
          </p>
          <span className="text-[11px] text-text-tertiary">Hồ sơ xét tuyển</span>
        </div>

        <div className="rounded-xl bg-background-gray-primary/60 p-2.5">
          <span className="text-xs text-text-tertiary">Áp lực cạnh tranh</span>
          <p className="mt-0.5 text-base font-bold text-amber-500">
            {formatMetricValue(province, "competition")}
          </p>
          <span className="text-[11px] text-text-tertiary">Đối thủ cùng vùng</span>
        </div>

        <div className="rounded-xl bg-background-gray-primary/60 p-2.5">
          <span className="text-xs text-text-tertiary">Doanh thu dự phóng</span>
          <p className="mt-0.5 text-base font-bold text-text-primary">
            {formatMetricValue(province, "revenue")}
          </p>
          <span className="text-[11px] text-text-tertiary">Kỳ tuyển sinh này</span>
        </div>
      </div>

      {/* 4. Tab Switcher for Bottom Section */}
      <div className="mt-2 flex items-center gap-1 rounded-xl bg-background-gray-primary/80 p-1 text-xs">
        <button
          className={`flex-1 rounded-lg py-1.5 font-semibold transition-colors ${
            activeTab === "insight"
              ? "bg-card-background text-text-primary shadow-xs"
              : "text-text-secondary hover:text-text-primary"
          }`}
          onClick={() => setActiveTab("insight")}
          type="button"
        >
          Đề xuất AI
        </button>
        <button
          className={`flex-1 rounded-lg py-1.5 font-semibold transition-colors ${
            activeTab === "schools"
              ? "bg-card-background text-text-primary shadow-xs"
              : "text-text-secondary hover:text-text-primary"
          }`}
          onClick={() => setActiveTab("schools")}
          type="button"
        >
          Trường THPT ({province.highSchools.length})
        </button>
      </div>

      {/* 5. Tab Content Area */}
      <div className="mt-2 flex-1 min-h-0 overflow-y-auto pr-0.5">
        {activeTab === "insight" ? (
          <div className="space-y-2 text-xs">
            <div className="rounded-xl bg-brand-500/10 p-2.5">
              <span className="font-bold text-brand-500 text-xs">
                FAIP Intelligence
              </span>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                {province.recommendation}
              </p>
            </div>

            <div className="rounded-xl bg-background-gray-primary/50 p-2.5 text-text-secondary">
              <div className="flex items-center justify-between text-xs font-medium text-text-tertiary">
                <span>Hành động cốt lõi</span>
                <span className="font-bold text-text-primary">
                  {province.keyAction}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {province.highSchools.map((hs) => (
              <div
                className="flex items-center justify-between rounded-xl bg-background-gray-primary/60 p-2 text-xs"
                key={hs.id}
              >
                <div className="min-w-0 pr-2">
                  <p className="truncate text-xs font-bold text-text-primary">
                    {hs.name}
                  </p>
                  <span className="text-[11px] text-text-tertiary">
                    {hs.district} • {hs.tier}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xs font-bold text-text-primary">
                    {hs.applications} HS
                  </span>
                  <span className="block text-[11px] font-semibold text-success-500">
                    {hs.penetrationRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Footer Action */}
      <div className="mt-2 pt-1">
        <Button
          className="h-9.5 w-full justify-center gap-2 text-xs font-bold shadow-xs"
          onPress={() => {}}
          size="sm"
          variant="primary"
        >
          <span>Kích hoạt chiến dịch tại {province.name}</span>
          <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}
