import { ArrowRight, InfoTriangle } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { attentionItems } from "./data";
import type { MetricTone } from "./types";

const TONE_STYLES: Record<MetricTone, { icon: string; badge: "primary" | "success" | "warning" | "error" | "blue" }> = {
  primary: { icon: "bg-brand-500", badge: "primary" },
  info: { icon: "bg-blue-500", badge: "blue" },
  success: { icon: "bg-green-500", badge: "success" },
  warning: { icon: "bg-orange-400", badge: "warning" },
  danger: { icon: "bg-red-500", badge: "error" },
};

const PRIORITY_LABEL = {
  high: "Khẩn cấp",
  medium: "Cần xem",
  low: "Đang chờ",
} as const;

export default function AttentionQueue() {
  return (
    <Card className="min-w-0">
      <CardHeader className="mb-5">
        <div>
          <CardTitle>Cần xử lý</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">Các hàng đợi cần Giám đốc xem hôm nay</p>
        </div>
        <span className="flex size-8 items-center justify-center rounded-full bg-badge-error-background text-badge-error-icon-color">
          <InfoTriangle size={16} aria-hidden="true" />
        </span>
      </CardHeader>

      <div className="space-y-1">
        {attentionItems.map((item) => {
          const tone = TONE_STYLES[item.tone];

          return (
            <Link
              key={item.id}
              href={item.href}
              className="group flex items-start gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-background-gray-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${tone.icon}`} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">{item.label}</span>
                  <Badge color={tone.badge} size="sm">
                    {PRIORITY_LABEL[item.priority]}
                  </Badge>
                </span>
                <span className="mt-1 block text-xs leading-4 text-text-tertiary">{item.description}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-text-secondary">
                {item.count}
                <ArrowRight
                  size={14}
                  className="text-icon-tertiary transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-card-border pt-4 text-xs">
        <span className="text-text-tertiary">Tổng cộng 125 mục cần theo dõi</span>
        <Link href="/director/ai/next-best-action" className="font-semibold text-brand-500 hover:text-brand-600">
          Xem tất cả
        </Link>
      </div>
    </Card>
  );
}
