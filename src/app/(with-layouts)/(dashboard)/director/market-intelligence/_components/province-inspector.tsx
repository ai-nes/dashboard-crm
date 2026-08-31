"use client";

import { ArrowRight, Sparkle } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { sortByAvailableScore } from "@/services/api/market-intelligence";

import {
  getOpportunityBadgeVariant,
  opportunityLabel,
  REGION_CONFIGS,
} from "./data";
import SchoolSpotlight from "./school-spotlight";
import type { HighSchoolItem, ProvinceMetrics } from "./types";

interface ProvinceInspectorProps {
  onSelectSchool: (provinceCode: string, schoolId: string) => void;
  province: ProvinceMetrics | null;
  selectedSchoolId: string | null;
}

const classificationConfig: Record<NonNullable<HighSchoolItem["classification"]>, { color: "success" | "primary" | "warning" | "gray"; label: string }> = {
  "Trọng điểm": { color: "success", label: "Trọng điểm" },
  "Mở rộng": { color: "primary", label: "Mở rộng" },
  "Duy trì": { color: "warning", label: "Duy trì" },
  "Sàng lọc": { color: "gray", label: "Sàng lọc" },
};

export default function ProvinceInspector({ onSelectSchool, province, selectedSchoolId }: ProvinceInspectorProps) {
  if (!province) {
    return (
      <aside className="flex h-full min-w-0 flex-col items-center justify-center rounded-2xl bg-card-background p-6 text-center" aria-label="Phân tích địa bàn">
        <span className="text-3xl" aria-hidden="true">🗺️</span>
        <h2 className="mt-3 text-sm font-semibold text-text-primary">Chưa chọn địa bàn</h2>
        <p className="mt-1 text-xs text-text-secondary">Nhấp vào tỉnh hoặc điểm trường trên bản đồ để xem phân tích chi tiết.</p>
      </aside>
    );
  }

  const schools = sortByAvailableScore(province.highSchools, "potentialScore");
  const selectedSchool = selectedSchoolId
    ? schools.find((school) => school.id === selectedSchoolId) ?? null
    : null;
  const badgeVariant = getOpportunityBadgeVariant(province.opportunity);
  const regionLabel = REGION_CONFIGS[province.regionKey]?.label ?? province.regionKey;

  return (
    <aside className="flex h-full min-h-[640px] min-w-0 flex-col overflow-hidden rounded-2xl bg-card-background xl:min-h-0" aria-label={`Phân tích thị trường ${province.name}`}>
      <header className="shrink-0 border-b border-card-border bg-background-soft-50 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-primary-500 uppercase">Phân tích địa bàn</p>
          <Badge color={badgeVariant}>{opportunityLabel(province.opportunity)}</Badge>
        </div>
        <div className="mt-1 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold tracking-[-0.3px] text-text-primary" title={province.name}>{province.name}</h2>
            <p className="mt-0.5 truncate text-xs text-text-secondary">{regionLabel} · {province.highSchools.length} trường nổi bật</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-semibold leading-none text-primary-600">{formatNullable(province.opportunity)}</p>
            <p className="mt-1 text-[10px] text-text-tertiary">Điểm cơ hội /100</p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <section aria-labelledby="school-list-title" className="mt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 id="school-list-title" className="text-sm font-semibold text-text-primary">Trường THPT nổi bật</h3>
              <p className="mt-0.5 text-xs text-text-tertiary">Chọn trường để xem chi tiết</p>
            </div>
            <span className="shrink-0 text-xs font-medium text-text-tertiary">{schools.length} trường</span>
          </div>

          <div className="mt-3 space-y-2">
            {schools.map((school, index) => {
              const status = school.classification ? classificationConfig[school.classification] : { color: "gray" as const, label: "Chưa phân loại" };
              const isSelected = selectedSchool?.id === school.id;

              return (
                <button
                  aria-pressed={isSelected}
                  className={`flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${isSelected ? "border-primary-200 bg-badge-primary-background" : "border-card-border bg-card-background hover:border-primary-200 hover:bg-background-soft-50"}`}
                  key={school.id}
                  onClick={() => onSelectSchool(province.code, school.id)}
                  type="button"
                >
                  <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${isSelected ? "bg-primary-500 text-primary-text" : "bg-background-soft-100 text-text-secondary"}`}>{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-semibold text-text-primary" title={school.name}>{school.name}</span>
                      <Badge color={status.color} className="shrink-0 text-[10px]">{status.label}</Badge>
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-text-tertiary">{school.district ?? "-"} · {formatPercent(school.penetrationRate)} tiếp cận</span>
                  </span>
                  <span className="shrink-0 text-right"><span className="block text-sm font-semibold text-primary-600">{formatNullable(school.potentialScore)}</span><span className="text-[10px] text-text-tertiary">Điểm cơ hội</span></span>
                </button>
              );
            })}
          </div>
        </section>

        {selectedSchool && <SchoolSpotlight provinceName={province.name} school={selectedSchool} />}

        <section aria-labelledby="province-recommendation-title" className="mt-5 rounded-xl border border-card-border bg-background-soft-50 p-3.5">
          <div className="flex items-start gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-badge-primary-background text-primary-500" aria-hidden="true"><Sparkle size={15} /></span>
            <div className="min-w-0">
              <h3 id="province-recommendation-title" className="text-xs font-semibold text-text-primary">Gợi ý tiếp cận</h3>
              <p className="mt-1 text-xs leading-5 text-text-secondary">{province.recommendation ?? "-"}</p>
              {province.keyAction && <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-primary-500"><ArrowRight size={13} className="mt-0.5 shrink-0" />{province.keyAction}</p>}
            </div>
          </div>
        </section>
      </div>

    </aside>
  );
}

function formatNullable(value: number | null) {
  if (value === null) return "-";
  return String(value);
}

function formatPercent(value: number | null) {
  return value === null ? "-" : `${value}%`;
}
