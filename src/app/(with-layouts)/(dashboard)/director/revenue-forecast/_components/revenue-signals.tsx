import { ArrowRight, InfoTriangle } from "@tailgrids/icons";
import Link from "next/link";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { negativeDrivers, positiveDrivers } from "./data";

export default function RevenueSignals() {
  return (
    <Card className="min-w-0 bg-background-gray-primary">
      <CardHeader className="items-start">
        <div>
          <CardTitle className="text-base">Tín hiệu gần đây</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Các yếu tố đang tác động forecast</p>
        </div>
        <span className="rounded-full bg-badge-warning-background px-2 py-1 text-[11px] font-semibold text-badge-warning-text">3 tín hiệu</span>
      </CardHeader>

      <div className="mt-5 space-y-2.5">
        <SignalRow label={positiveDrivers[0].label} description={positiveDrivers[0].description} value={positiveDrivers[0].value} positive />
        <SignalRow label={positiveDrivers[1].label} description={positiveDrivers[1].description} value={positiveDrivers[1].value} positive />
        <SignalRow label={negativeDrivers[0].label} description={negativeDrivers[0].description} value={negativeDrivers[0].value} />
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-lg bg-badge-warning-background p-3 text-[11px] leading-5 text-badge-warning-text">
        <InfoTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>Rủi ro lớn nhất đang nằm ở khu vực Đồng bằng sông Cửu Long.</span>
      </div>

      <Link href="/director/ai/next-best-action" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600">
        Xem AI giải thích
        <ArrowRight size={13} aria-hidden="true" />
      </Link>
    </Card>
  );
}

function SignalRow({ label, description, value, positive = false }: { label: string; description: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-xl bg-card-background p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <span className={`mt-1 size-2 shrink-0 rounded-full ${positive ? "bg-success-500" : "bg-error-500"}`} aria-hidden="true" />
          <span className="truncate text-xs font-semibold text-text-secondary">{label}</span>
        </span>
        <span className={`shrink-0 text-xs font-semibold ${positive ? "text-success-500" : "text-error-500"}`}>{value}</span>
      </div>
      <p className="mt-1 pl-4 text-[11px] leading-4 text-text-tertiary">{description}</p>
    </div>
  );
}
