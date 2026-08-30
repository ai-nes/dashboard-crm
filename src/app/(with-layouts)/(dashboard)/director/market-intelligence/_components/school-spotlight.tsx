import { ArrowRight, Buildings11, TrendUp2 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";

import type { HighSchoolItem } from "./types";

interface SchoolSpotlightProps {
  provinceName: string;
  school: HighSchoolItem;
}

const classificationConfig: Record<HighSchoolItem["classification"], { color: "success" | "primary" | "warning" | "gray"; label: string }> = {
  "Trọng điểm": { color: "success", label: "Trọng điểm · Key Account" },
  "Mở rộng": { color: "primary", label: "Mở rộng" },
  "Duy trì": { color: "warning", label: "Duy trì" },
  "Sàng lọc": { color: "gray", label: "Sàng lọc" },
};

export default function SchoolSpotlight({ provinceName, school }: SchoolSpotlightProps) {
  const status = classificationConfig[school.classification];

  return (
    <section aria-labelledby="selected-school-title" className="mt-5 rounded-xl border border-primary-200 bg-badge-primary-background/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card-background text-primary-500 shadow-xs" aria-hidden="true">
            <Buildings11 size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.12em] text-primary-500 uppercase">Trường đang phân tích</p>
            <h3 id="selected-school-title" className="mt-1 truncate text-sm font-semibold text-text-primary" title={school.name}>{school.name}</h3>
            <p className="mt-0.5 truncate text-xs text-text-secondary">{school.district} · {provinceName}</p>
          </div>
        </div>
        <Badge color={status.color}>{status.label}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">
        <div className="rounded-lg bg-card-background/80 p-2.5">
          <p className="text-[10px] text-text-tertiary">Potential</p>
          <p className="mt-0.5 text-lg font-semibold text-text-primary">{school.potentialScore}<span className="text-xs font-medium text-text-tertiary">/100</span></p>
        </div>
        <div className="rounded-lg bg-card-background/80 p-2.5">
          <p className="text-[10px] text-text-tertiary">Lớp 12</p>
          <p className="mt-0.5 text-lg font-semibold text-text-primary">{school.grade12Students.toLocaleString("vi-VN")}</p>
        </div>
        <div className="rounded-lg bg-card-background/80 p-2.5">
          <p className="text-[10px] text-text-tertiary">Prospect</p>
          <p className="mt-0.5 text-lg font-semibold text-text-primary">{school.prospects.toLocaleString("vi-VN")}</p>
        </div>
        <div className="rounded-lg bg-card-background/80 p-2.5">
          <p className="text-[10px] text-text-tertiary">Forecast</p>
          <p className="mt-0.5 flex items-center gap-1 text-lg font-semibold text-success-500"><TrendUp2 size={14} />{school.enrollmentForecast}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-medium text-text-secondary">Mức độ tiếp cận</span>
          <span className="font-semibold text-text-primary">{school.penetrationRate}% · CR {school.conversionRate}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card-background">
          <div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.min(100, school.penetrationRate * 8)}%` }} />
        </div>
        <p className="mt-1.5 text-[11px] text-text-tertiary">Cập nhật gần nhất: {school.lastActivity}</p>
      </div>

      <div className="mt-4 border-t border-primary-200 pt-3">
        <p className="text-xs font-semibold text-primary-600">Vì sao nên chọn trường này?</p>
        <p className="mt-1 text-xs leading-5 text-text-secondary">{school.recommendation}. Trường đang tạo ra {school.applications} hồ sơ xét tuyển.</p>
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-card-background/75 p-2.5">
          <ArrowRight size={14} className="mt-0.5 shrink-0 text-primary-500" aria-hidden="true" />
          <div>
            <p className="text-[10px] font-medium text-text-tertiary">Bước tiếp theo</p>
            <p className="mt-0.5 text-xs font-semibold leading-5 text-text-primary">{school.nextAction}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
