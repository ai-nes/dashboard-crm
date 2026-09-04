import { ArrowRight, TrendUp2 } from "@tailgrids/icons";
import Link from "next/link";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { contactResults } from "./_components/data";

export default function ContactResults() {
  const maxValue = Math.max(...contactResults.map((item) => item.value));
  const totalContacts = contactResults.reduce((total, item) => total + item.value, 0);

  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Kết quả liên hệ</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Hiệu quả từ {totalContacts} lượt cập nhật gần nhất.</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-badge-success-background px-2.5 py-1 text-[11px] font-semibold text-success-600">
          <TrendUp2 size={13} aria-hidden="true" />
          12% kết nối
        </span>
      </CardHeader>

      <div className="mt-6 space-y-4">
        {contactResults.map((item) => {
          const percentage = Math.round((item.value / totalContacts) * 100);

          return (
            <div key={item.id} className="grid grid-cols-[7.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-xs sm:grid-cols-[9rem_minmax(0,1fr)_3rem] sm:gap-4">
              <div className="flex min-w-0 items-center gap-2">
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
                <span className="truncate font-medium text-text-secondary">{item.label}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-background-soft-100">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: item.color }} />
              </div>
              <div className="text-right">
                <span className="font-semibold text-text-primary">{item.value}</span>
                <span className="ml-1 text-[10px] text-text-tertiary">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-card-border pt-4">
        <p className="text-xs text-text-tertiary">Tỷ lệ kết nối đang tăng đều trong tuần.</p>
        <Link
          href="/ctv-sale/results"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-500 transition-colors hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          Xem báo cáo
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
