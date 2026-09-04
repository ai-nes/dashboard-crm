import { ArrowRight, CalendarTime, UserPencil } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";

export default function LeadSaleHeader() {
  return (
    <header className="relative isolate overflow-hidden rounded-2xl border border-card-border bg-card-background px-5 py-5 shadow-xs sm:px-6 lg:px-7 lg:py-6">
      <div className="pointer-events-none absolute -top-24 -right-8 -z-10 size-72 rounded-full bg-primary-50/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 -z-10 size-60 rounded-full bg-badge-sky-background/50 blur-3xl" />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge color="primary">LEAD SALE · TỔNG QUAN</Badge>
            <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
              <CalendarTime size={14} aria-hidden="true" />
              Thứ Bảy, 05/09/2026
            </span>
          </div>
          <h1 className="mt-4 text-balance text-[26px] leading-8 font-semibold tracking-[-0.5px] text-text-primary sm:text-[30px]">
            Tổng quan đội ngũ Sale
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Theo dõi phân công, điểm cần can thiệp và kết quả của đội trong ngày.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/lead-sale/student-assignment"
            className="inline-flex items-center gap-2 rounded-lg bg-button-primary-background px-3.5 py-2.5 text-sm font-semibold text-button-primary-text transition-colors hover:bg-button-primary-hover-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            <UserPencil size={16} aria-hidden="true" />
            Phân công học sinh
          </Link>
          <Link
            href="/lead-sale/tasks"
            className="group inline-flex items-center gap-2 rounded-lg border border-button-primary-outline-stroke bg-button-primary-outline-background px-3.5 py-2.5 text-sm font-semibold text-button-primary-outline-text transition-colors hover:bg-button-primary-outline-hover-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            Mở việc cần xử lý
            <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
