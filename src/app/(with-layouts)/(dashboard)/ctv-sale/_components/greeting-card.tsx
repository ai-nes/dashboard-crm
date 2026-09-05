import { Calendar, CheckCircle1, ChevronRight } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import type { CtvSaleOverviewMeta } from "@/services/api/ctv-sale";

import { formatReportDate } from "./formatters";

interface GreetingCardProps {
  meta: CtvSaleOverviewMeta;
  priorityTaskCount: number;
}

export default function GreetingCard({
  meta,
  priorityTaskCount,
}: GreetingCardProps) {
  return (
    <header className="relative isolate overflow-hidden rounded-2xl border border-card-border bg-card-background px-5 py-5 shadow-sm lg:px-7 lg:py-6">
      <div className="pointer-events-none absolute -top-20 -right-8 -z-10 size-64 rounded-full bg-primary-50/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 -z-10 size-52 rounded-full bg-badge-sky-background/70 blur-3xl" />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge
              color="primary"
              prefixIcon={<CheckCircle1 aria-hidden="true" />}
            >
              CTV SALE · TỔNG QUAN
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
              <Calendar size={14} aria-hidden="true" />
              {formatReportDate(meta.date, meta.timezone)}
            </span>
          </div>
          <h1 className="mt-4 text-balance text-[26px] leading-8 font-semibold tracking-[-0.5px] text-text-primary sm:text-[30px]">
            Chào buổi sáng, {meta.viewer.displayName}
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Bạn có{" "}
            <span className="font-semibold text-primary-500">
              {priorityTaskCount} việc
            </span>{" "}
            cần ưu tiên hôm nay. Bắt đầu từ những hồ sơ sắp đến hạn.
          </p>
        </div>

        <Link
          href="/ctv-sale/tasks"
          className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3.5 py-2.5 text-sm font-semibold text-primary-600 transition-colors hover:border-primary-300 hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          Mở danh sách việc
          <ChevronRight
            size={16}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </header>
  );
}
