import { ArrowRight, CalendarTime, UserPencil } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";

import type { LeadSaleDashboardData } from "./lead-sale-dashboard.types";

interface DashboardHeaderProps {
  data: LeadSaleDashboardData;
}

export default function DashboardHeader({ data }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-card-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge color="primary">TRƯỞNG NHÓM TUYỂN SINH</Badge>
          <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
            <CalendarTime size={14} aria-hidden="true" />
            {data.periodLabel}
          </span>
        </div>
        <h1 className="mt-3 text-balance text-[26px] leading-8 font-semibold tracking-[-0.5px] text-text-primary sm:text-[30px]">
          Tổng quan tuyển sinh
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          {data.teamName} · {data.scopeLabel} · Tổng hợp chỉ tiêu, cơ hội và các hồ sơ cần hỗ trợ.
        </p>
        <p className="mt-2 text-[11px] text-text-tertiary">Cập nhật lúc {data.asOf}</p>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Link
          href="/lead-sale/student-assignment"
          className="inline-flex items-center gap-2 rounded-lg bg-button-primary-background px-3.5 py-2.5 text-sm font-semibold text-button-primary-text transition-colors hover:bg-button-primary-hover-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          <UserPencil size={16} aria-hidden="true" />
          Phân công Lead
        </Link>
        <Link
          href="/lead-sale/tasks"
          className="group inline-flex items-center gap-2 rounded-lg border border-button-primary-outline-stroke bg-button-primary-outline-background px-3.5 py-2.5 text-sm font-semibold text-button-primary-outline-text transition-colors hover:bg-button-primary-outline-hover-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          Danh sách công việc
          <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </header>
  );
}
