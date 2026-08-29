import { ArrowLeft, Buildings11, MapMarker5, UserMultiple1 } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolHeaderProps {
  data: SchoolIntelligenceData;
}

export default function SchoolHeader({ data }: SchoolHeaderProps) {
  const { school, potentialScore } = data;

  return (
    <header className="min-w-0">
      <Link
        href="/director/schools"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-button-primary-focus-ring"
      >
        <ArrowLeft size={16} />
        Danh sách trường THPT
      </Link>

      <div className="flex min-w-0 flex-col gap-5 rounded-xl border border-card-border bg-card-background p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-badge-primary-background text-lg font-semibold text-badge-primary-text" aria-hidden="true">
            {school.name.replace(/^THPT\s+/i, "").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge color="primary">Admission account</Badge>
              {school.isBoardingSchool && <Badge color="violet">Trường DTNT</Badge>}
            </div>
            <h1 className="text-balance text-2xl font-semibold tracking-[-0.4px] text-text-primary lg:text-[28px] lg:leading-8">
              {school.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-1.5"><MapMarker5 size={15} className="text-icon-tertiary" />{school.district}, {school.province}</span>
              <span className="inline-flex items-center gap-1.5"><Buildings11 size={15} className="text-icon-tertiary" />Mã trường: {school.schoolCode}</span>
              <span className="inline-flex items-center gap-1.5"><UserMultiple1 size={15} className="text-icon-tertiary" />{school.area}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 rounded-lg bg-background-soft-50 p-4 lg:min-w-52">
          <div>
            <p className="text-xs font-medium text-text-secondary">Potential Score</p>
            <p className="mt-1 text-3xl leading-none font-semibold text-text-primary">
              {potentialScore}<span className="text-base font-medium text-text-tertiary">/100</span>
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <div className="h-2 overflow-hidden rounded-full bg-background-soft-300" aria-hidden="true">
              <div className="h-full rounded-full bg-success-500" style={{ width: `${potentialScore}%` }} />
            </div>
            <p className="mt-2 text-xs font-medium text-success-500">{potentialScore >= 85 ? "Rất cao" : "Cao"} · Ưu tiên khai thác</p>
          </div>
        </div>
      </div>

      {school.address && <p className="mt-2 px-1 text-xs leading-5 text-text-tertiary">Địa chỉ: {school.address}</p>}
    </header>
  );
}
