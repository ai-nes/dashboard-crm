import { ArrowLeft, MapMarker5 } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import type { SchoolClassification, SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolHeaderProps {
  data: SchoolIntelligenceData;
}

const classificationTone: Record<SchoolClassification, { badge: "success" | "primary" | "warning" | "gray"; surface: string }> = {
  "Trọng điểm": { badge: "success", surface: "bg-badge-success-background" },
  "Mở rộng": { badge: "primary", surface: "bg-badge-primary-background" },
  "Duy trì": { badge: "warning", surface: "bg-badge-warning-background" },
  "Sàng lọc": { badge: "gray", surface: "bg-badge-neutral-background" },
};

export default function SchoolHeader({ data }: SchoolHeaderProps) {
  const { school, classification, geography, relationship } = data;
  const tone = classificationTone[classification.group];

  return (
    <header className="min-w-0">
      <Link
        href="/director/market-intelligence"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-button-primary-focus-ring"
      >
        <ArrowLeft size={16} />
        Quay lại bản đồ địa bàn
      </Link>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-card-border bg-card-background">
        <div className="grid min-w-0 gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.38fr)] lg:p-6">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-badge-primary-background text-lg font-semibold text-badge-primary-text"
              aria-hidden="true"
            >
              {school.name.replace(/^THPT\s+/i, "").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge color="primary">School 360</Badge>
                {school.isBoardingSchool && <Badge color="violet">Trường DTNT</Badge>}
                <span className="text-xs text-text-tertiary">Mã {school.schoolCode}</span>
              </div>
              <h1 className="text-balance text-2xl font-semibold tracking-[-0.4px] text-text-primary lg:text-[30px] lg:leading-9">
                {school.name}
              </h1>
              <p className="mt-2 flex items-start gap-1.5 text-sm leading-5 text-text-secondary">
                <MapMarker5 size={16} className="mt-0.5 shrink-0 text-icon-tertiary" />
                <span>{school.district}, {school.province} · {geography.cluster}</span>
              </p>
              <p className="mt-1 text-xs leading-5 text-text-tertiary">{school.address}</p>
            </div>
          </div>

          <div className={`rounded-2xl p-4 ${tone.surface}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-text-secondary">Phân loại khai thác</p>
                <p className="mt-1 text-2xl font-semibold text-text-primary">{classification.group}</p>
              </div>
              <Badge color={tone.badge}>{classification.label}</Badge>
            </div>
            <p className="mt-3 text-sm leading-5 text-text-secondary">{classification.action}</p>
          </div>
        </div>

        <div className="grid gap-4 border-t border-card-border px-5 py-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
          <HeaderFact label="Cụm địa bàn" value={geography.cluster} />
          <HeaderFact label="Thời gian đến campus" value={`${geography.travelTime} · ${geography.distanceTier}`} />
          <HeaderFact label="Mật độ cạnh tranh" value={geography.competitionDensity} />
          <HeaderFact label="Quan hệ hiện tại" value={relationship.level} />
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-card-border bg-background-soft-50 px-5 py-3 text-xs text-text-tertiary lg:px-6">
          <span>Dữ liệu directory: hồ sơ trường & địa chỉ</span>
          <span>Dữ liệu quan hệ: {relationship.source}</span>
          <span className="font-medium text-text-secondary">{data.dataFreshness}</span>
        </div>
      </div>
    </header>
  );
}

function HeaderFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-text-primary" title={value}>{value}</p>
    </div>
  );
}
