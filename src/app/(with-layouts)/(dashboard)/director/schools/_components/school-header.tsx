import { ArrowLeft, MapMarker5 } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolHeaderProps {
  data: SchoolIntelligenceData;
}

export default function SchoolHeader({ data }: SchoolHeaderProps) {
  const { school, potentialScore } = data;

  return (
    <header className="min-w-0">
      <Link
        href="/director/market-intelligence"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-button-primary-focus-ring"
      >
        <ArrowLeft size={16} />
        Quay lại bản đồ & trường THPT
      </Link>

      <div className="min-w-0 rounded-xl border border-card-border bg-card-background p-5 lg:p-6">
        <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-badge-primary-background text-lg font-semibold text-badge-primary-text"
              aria-hidden="true"
            >
              {school.name
                .replace(/^THPT\s+/i, "")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge color="primary">Tài khoản tuyển sinh</Badge>
                {school.isBoardingSchool && (
                  <Badge color="violet">Trường DTNT</Badge>
                )}
              </div>
              <h1 className="text-balance text-2xl font-semibold tracking-[-0.4px] text-text-primary lg:text-[28px] lg:leading-8">
                {school.name}
              </h1>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary">
                <span className="inline-flex items-center gap-1.5">
                  <MapMarker5 size={15} className="text-icon-tertiary" />
                  {school.district}, {school.province}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4 rounded-lg bg-background-soft-50 p-4 lg:min-w-52">
            <div>
              <p className="text-xs font-medium text-text-secondary">
                Điểm tiềm năng
              </p>
              <p className="mt-1 text-3xl leading-none font-semibold text-text-primary">
                {potentialScore}
                <span className="text-base font-medium text-text-tertiary">
                  /100
                </span>
              </p>
            </div>
            <div className="min-w-0 flex-1">
              <div
                className="h-2 overflow-hidden rounded-full bg-background-soft-300"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-success-500"
                  style={{ width: `${potentialScore}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-medium text-success-500">
                {potentialScore >= 85 ? "Rất cao" : "Cao"} · Ưu tiên khai thác
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-card-border pt-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold tracking-[0.12em] text-text-secondary uppercase">
              Hồ sơ trường
            </p>
            <Badge color="success">Đã đồng bộ</Badge>
          </div>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <HeaderFact label="Tỉnh / Thành" value={school.province} />
            <HeaderFact label="Quận / Huyện" value={school.district} />
            <HeaderFact label="Khu vực tuyển sinh" value={school.area} />
            <HeaderFact
              label="Quy mô lớp 12"
              value={`${data.grade12Students.toLocaleString("vi-VN")} học sinh`}
            />
            <HeaderFact
              label="Loại hình"
              value={school.isBoardingSchool ? "Trường DTNT" : "Trường THPT"}
            />
            <HeaderFact label="Mã trường" value={school.schoolCode} />
            {school.address && (
              <HeaderFact
                className="sm:col-span-2 lg:col-span-3"
                label="Địa chỉ"
                value={school.address}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function HeaderFact({
  className,
  label,
  value,
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="mt-1 text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}
