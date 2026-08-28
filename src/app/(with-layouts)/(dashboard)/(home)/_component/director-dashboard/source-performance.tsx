import { ArrowRight } from "@tailgrids/icons";
import Link from "next/link";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { sourcePerformance } from "./data";

export default function SourcePerformance() {
  return (
    <Card className="min-w-0">
      <CardHeader className="mb-6">
        <div>
          <CardTitle>Nguồn hồ sơ</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">Đóng góp vào pipeline và kết quả nhập học</p>
        </div>
        <Link href="/director/marketing/attribution" className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600">
          Xem phân bổ
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </CardHeader>

      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto_auto] gap-3 text-xs font-medium text-text-tertiary">
        <span>Nguồn</span>
        <span>Đã nộp hồ sơ</span>
        <span>Đã nhập học</span>
      </div>

      <div className="space-y-4">
        {sourcePerformance.map((source) => (
          <div key={source.id}>
            <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span className={`size-2 shrink-0 rounded-full ${source.barClassName}`} aria-hidden="true" />
                <span className="truncate font-medium text-text-secondary">{source.label}</span>
                <span className="hidden text-xs text-text-tertiary sm:inline">{source.leads} hồ sơ</span>
              </div>
              <span className="font-medium text-text-primary">{source.applicants}</span>
              <span className="font-semibold text-text-primary">{source.enrolled}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-background-gray-secondary">
              <div className={`h-full rounded-full ${source.barClassName}`} style={{ width: `${source.share * 3}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-card-border pt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-tertiary">Tổng hồ sơ từ 5 nguồn chính</span>
          <span className="font-semibold text-text-primary">11,412</span>
        </div>
      </div>
    </Card>
  );
}
