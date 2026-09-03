"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { sortByAvailableScore } from "@/services/api/market-intelligence";
import { SCHOOL_CLASSIFICATION_VISUALS } from "./school-classification-visuals";
import SchoolSearchField from "./school-search-field";

import type { HighSchoolItem, ProvinceMetrics } from "./types";

interface AllSchoolsInspectorProps {
  onSelectSchool: (provinceCode: string, schoolId: string) => void;
  onSchoolQueryChange: (query: string) => void;
  provinces: ProvinceMetrics[];
  schoolQuery: string;
}

function getSchoolBadge(classification: HighSchoolItem["classification"]) {
  if (!classification) return { color: "gray" as const, label: "Chưa phân loại" };
  return { color: SCHOOL_CLASSIFICATION_VISUALS[classification].badgeColor, label: classification };
}

export default function AllSchoolsInspector({
  onSelectSchool,
  onSchoolQueryChange,
  provinces,
  schoolQuery,
}: AllSchoolsInspectorProps) {
  const schools = sortByAvailableScore(
    provinces.flatMap((province) =>
      province.highSchools.map((school) => ({
        potentialScore: school.potentialScore,
        province,
        school,
      })),
    ),
    "potentialScore",
  );

  return (
    <aside
      className="flex h-full min-h-[640px] min-w-0 flex-col overflow-hidden rounded-2xl bg-card-background xl:min-h-0"
      aria-label="Danh sách tất cả trường THPT"
    >
      <header className="shrink-0 border-b border-card-border bg-background-soft-50 p-4">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-primary-500 uppercase">
          Phân tích địa bàn
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-[-0.3px] text-text-primary">
              Tất cả địa bàn
            </h2>
            <p className="mt-0.5 text-xs text-text-secondary">
              Toàn quốc · {schools.length} trường trong danh sách
            </p>
          </div>
        </div>
        <SchoolSearchField onChange={onSchoolQueryChange} value={schoolQuery} />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <section aria-labelledby="all-school-list-title" className="mt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3
                id="all-school-list-title"
                className="text-sm font-semibold text-text-primary"
              >
                Tất cả trường THPT
              </h3>
              <p className="mt-0.5 text-xs text-text-tertiary">
                Chọn trường để xem chi tiết
              </p>
            </div>
            <span className="shrink-0 text-xs font-medium text-text-tertiary">
              {schools.length} trường
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {schools.length === 0 && (
              <p className="rounded-xl bg-background-soft-50 px-3 py-6 text-center text-xs text-text-secondary">
                Không tìm thấy trường phù hợp với điều kiện hiện tại.
              </p>
            )}
            {schools.map(({ province, school }, index) => {
              const status = getSchoolBadge(school.classification);

              return (
                <button
                  className="flex w-full items-center gap-2.5 rounded-xl border border-card-border bg-card-background p-2.5 text-left transition hover:border-primary-200 hover:bg-background-soft-50"
                  key={`${province.code}-${school.id}`}
                  onClick={() => onSelectSchool(province.code, school.id)}
                  type="button"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background-soft-100 text-xs font-semibold text-text-secondary">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="truncate text-xs font-semibold text-text-primary"
                        title={school.name}
                      >
                        {school.name}
                      </span>
                      <Badge
                        color={status.color}
                        className="shrink-0 text-[10px]"
                      >
                        {status.label}
                      </Badge>
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-text-tertiary">
                      {province.name} · {school.district ?? "-"}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold text-primary-600">
                      {formatNullable(school.potentialScore)}
                    </span>
                    <span className="text-[10px] text-text-tertiary">
                      Điểm cơ hội
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </aside>
  );
}

function formatNullable(value: number | null) {
  return value === null ? "-" : String(value);
}
