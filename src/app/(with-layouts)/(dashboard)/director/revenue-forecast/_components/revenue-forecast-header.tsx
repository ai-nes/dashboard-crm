"use client";

import { useRevenueForecastData } from "./revenue-forecast-context";

const PRIORITY_PROVINCES = [
  "Khánh Hòa",
  "Đắk Lắk",
  "Lâm Đồng",
  "TP. Hồ Chí Minh",
  "Đồng Nai",
  "Đồng Tháp",
  "Tây Ninh",
] as const;

export default function RevenueForecastHeader() {
  const { meta } = useRevenueForecastData();

  return (
    <header className="min-w-0 px-2 lg:px-6">
      <div className="min-w-0 overflow-hidden rounded-2xl border border-card-border bg-background-gray-primary p-5 lg:p-6">
        <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-badge-primary-background px-2.5 py-1 text-xs font-medium text-badge-primary-text">
                <span className="size-1.5 rounded-full bg-badge-primary-icon-color" />
                Dự báo khoản thu tuyển sinh
              </span>
              <span className="text-xs text-text-tertiary">
                Cập nhật 2 phút trước
              </span>
            </div>
            <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">
              Khoản thu & dự báo tuyển sinh
            </h1>
            <p className="max-w-2xl text-sm leading-5 text-text-tertiary">
              Đối chiếu khoản thu đã ghi nhận, dự báo cuối niên khóa và các kịch
              bản cải thiện kết quả tuyển sinh.
            </p>
          </div>

          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 xl:shrink-0">
            <span
              className="rounded-lg border border-card-border bg-card-background px-3 py-2 text-xs font-medium text-text-secondary"
              title={PRIORITY_PROVINCES.join(", ")}
            >
              Phạm vi: 7 tỉnh trọng điểm
            </span>
            <span className="rounded-lg border border-card-border bg-card-background px-3 py-2 text-xs font-medium text-text-secondary">
              Niên khóa {meta.admissionYear}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
