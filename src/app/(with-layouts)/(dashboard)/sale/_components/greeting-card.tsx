import { ArrowRight, CalendarTime, CheckCircle1 } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";

export default function GreetingCard() {
  return (
    <header className="relative isolate overflow-hidden rounded-2xl border border-card-border bg-card-background px-5 py-5 shadow-xs sm:px-6 lg:px-7 lg:py-6">
      <div className="pointer-events-none absolute -top-24 -right-8 -z-10 size-72 rounded-full bg-primary-50/80 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 -z-10 size-60 rounded-full bg-badge-sky-background/60 blur-3xl" />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge color="primary" prefixIcon={<CheckCircle1 aria-hidden="true" />}>
              SALE · TỔNG QUAN
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
              <CalendarTime size={14} aria-hidden="true" />
              Thứ Bảy, 05/09/2026
            </span>
          </div>
          <h1 className="mt-4 text-balance text-[26px] leading-8 font-semibold tracking-[-0.5px] text-text-primary sm:text-[30px]">
            Chào buổi sáng, Nguyễn Văn A
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Bạn có <span className="font-semibold text-primary-600">10 việc</span> cần xử lý hôm nay.
            Ưu tiên các task quá hạn và hồ sơ đang chờ bổ sung giấy tờ.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/sale/tasks"
            className="group inline-flex items-center gap-2 rounded-lg bg-button-primary-background px-3.5 py-2.5 text-sm font-semibold text-button-primary-text transition-colors hover:bg-button-primary-hover-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            Xem việc hôm nay
            <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/sale/students"
            className="inline-flex items-center gap-2 rounded-lg border border-button-primary-outline-stroke bg-button-primary-outline-background px-3.5 py-2.5 text-sm font-semibold text-button-primary-outline-text transition-colors hover:bg-button-primary-outline-hover-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            Xem hồ sơ
          </Link>
        </div>
      </div>
    </header>
  );
}
