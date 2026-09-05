import { ArrowRight, InfoCircle } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SaleAttentionItem } from "@/services/api/sale";

import { ATTENTION_PRESENTATION } from "./data";

const attentionStyles = {
  error: { icon: "bg-badge-error-background text-badge-error-text", badge: "error" as const },
  success: { icon: "bg-badge-success-background text-badge-success-text", badge: "success" as const },
  warning: { icon: "bg-badge-warning-background text-badge-warning-text", badge: "warning" as const },
};

interface AttentionStudentsProps {
  items: SaleAttentionItem[];
}

export default function AttentionStudents({ items }: AttentionStudentsProps) {
  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Học sinh cần chú ý</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Nhóm cần hành động sớm để không bỏ lỡ cơ hội.</p>
        </div>
        <InfoCircle size={18} className="text-icon-tertiary" aria-label="Phân loại hồ sơ cần chú ý" />
      </CardHeader>

      <div className="mt-5 space-y-2">
        {items.map((item) => {
          const presentation = ATTENTION_PRESENTATION[item.id];
          const styles = attentionStyles[presentation.tone];

          return (
            <Link
              key={item.id}
              href="/sale/students"
              className="group flex items-center gap-3 rounded-xl border border-transparent px-2 py-3 transition-colors hover:border-card-border hover:bg-background-soft-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              aria-label={`${presentation.label}: ${item.count} học sinh`}
            >
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
                <span className="text-sm font-bold">{item.count}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-text-primary">{presentation.label}</p>
                  <Badge color={styles.badge} size="sm">{item.count}</Badge>
                </div>
                <p className="mt-0.5 truncate text-[11px] leading-4 text-text-tertiary">{presentation.note}</p>
              </div>
              <ArrowRight size={15} aria-hidden="true" className="shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500" />
            </Link>
          );
        })}
      </div>

      <Link
        href="/sale/students"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      >
        Mở danh sách học sinh
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </Card>
  );
}
