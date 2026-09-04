import { ArrowRight } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { teamPerformance } from "./data";

export default function TeamPerformance() {
  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Hiệu suất đội ngũ</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">So sánh tiến độ xử lý của từng thành viên.</p>
        </div>
        <Link
          href="/lead-sale/sales-team"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          Xem đội ngũ
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </CardHeader>

      <div className="mt-5 hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[38rem] table-fixed border-collapse text-sm" aria-label="Bảng hiệu suất đội ngũ Sale">
          <colgroup>
            <col className="w-[32%]" />
            <col className="w-[15%]" />
            <col className="w-[13%]" />
            <col className="w-[13%]" />
            <col className="w-[27%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-card-border text-[10px] font-medium text-text-tertiary">
              <th scope="col" className="px-2 pb-3 text-left font-medium whitespace-nowrap">Thành viên</th>
            <th scope="col" className="px-2 pb-3 text-center font-medium whitespace-nowrap">Đang phụ trách</th>
            <th scope="col" className="px-2 pb-3 text-center font-medium whitespace-nowrap">Đã tư vấn</th>
            <th scope="col" className="px-2 pb-3 text-center font-medium whitespace-nowrap">Nhập học</th>
            <th scope="col" className="px-2 pb-3 text-center font-medium whitespace-nowrap">Tiến độ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {teamPerformance.map((member) => (
              <tr key={member.id}>
                <td className="px-2 py-3.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[10px] font-bold text-primary-600">{member.initials}</span>
                    <span className="truncate font-semibold text-text-primary">{member.name}</span>
                  </div>
                </td>
                <td className="px-2 py-3.5 text-center font-semibold text-text-primary">{member.activeStudents}</td>
                <td className="px-2 py-3.5 text-center font-semibold text-text-primary">{member.consulted}</td>
                <td className="px-2 py-3.5 text-center font-semibold text-success-500">{member.admitted}</td>
                <td className="px-2 py-3.5 text-center">
                  <Badge color={member.status === "Tốt" ? "success" : "warning"} size="sm" className="text-[10px]">{member.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 space-y-3 xl:hidden">
        {teamPerformance.map((member) => (
          <div key={member.id} className="rounded-xl border border-card-border bg-background-soft-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[10px] font-bold text-primary-600">{member.initials}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">{member.name}</p>
                  <p className="mt-0.5 text-[11px] text-text-tertiary">Đang theo dõi trong ngày</p>
                </div>
              </div>
              <Badge color={member.status === "Tốt" ? "success" : "warning"} size="sm" className="shrink-0 text-[10px]">{member.status}</Badge>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-card-background px-2 py-1.5">
                <p className="text-[10px] text-text-tertiary">Đang phụ trách</p>
                <p className="mt-0.5 text-sm font-semibold text-text-primary">{member.activeStudents}</p>
              </div>
              <div className="rounded-lg bg-card-background px-2 py-1.5">
                <p className="text-[10px] text-text-tertiary">Đã tư vấn</p>
                <p className="mt-0.5 text-sm font-semibold text-text-primary">{member.consulted}</p>
              </div>
              <div className="rounded-lg bg-card-background px-2 py-1.5">
                <p className="text-[10px] text-text-tertiary">Nhập học</p>
                <p className="mt-0.5 text-sm font-semibold text-success-500">{member.admitted}</p>
              </div>
            </div>

          </div>
        ))}
      </div>
    </Card>
  );
}
