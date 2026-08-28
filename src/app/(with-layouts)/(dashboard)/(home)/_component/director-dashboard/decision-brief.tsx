import { ArrowRight, CheckCircle1, Fire, InfoTriangle } from "@tailgrids/icons";
import Link from "next/link";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

const signals = [
  {
    id: "high-intent",
    icon: Fire,
    tone: "text-orange-500",
    title: "312 hồ sơ có ý định cao",
    description: "Đã xem học phí hoặc học bổng trong 24 giờ qua.",
    href: "/director/ai/lead-insights",
  },
  {
    id: "sla-recovery",
    icon: InfoTriangle,
    tone: "text-red-500",
    title: "24 hồ sơ đang quá SLA",
    description: "Hotline toàn quốc đang có tỷ lệ SLA thấp nhất.",
    href: "/director/sla",
  },
  {
    id: "conversion-ready",
    icon: CheckCircle1,
    tone: "text-green-500",
    title: "186 hồ sơ sẵn sàng chuyển đổi",
    description: "Đã đủ trạng thái nhập học và thông tin người học.",
    href: "/director/enrollment/conversion",
  },
];

export default function DecisionBrief() {
  return (
    <Card className="min-w-0 bg-background-gray-primary">
      <CardHeader className="mb-5">
        <div>
          <CardTitle>Điểm đáng chú ý</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">Tín hiệu nổi bật giúp Giám đốc quyết định nhanh</p>
        </div>
        <span className="rounded-full bg-card-background px-2.5 py-1 text-xs font-medium text-text-secondary">
          Hôm nay
        </span>
      </CardHeader>

      <div className="grid gap-3 lg:grid-cols-3">
        {signals.map((signal) => {
          const Icon = signal.icon;

          return (
            <Link
              key={signal.id}
              href={signal.href}
              className="group flex min-w-0 items-start gap-3 rounded-lg border border-card-border bg-card-background p-3 transition-colors hover:border-brand-300 hover:bg-background-white-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-background-gray-primary ${signal.tone}`}>
                <Icon size={16} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-text-primary">{signal.title}</span>
                <span className="mt-1 block text-xs leading-4 text-text-tertiary">{signal.description}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-500">
                  Xem chi tiết
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
