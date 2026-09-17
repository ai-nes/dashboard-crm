import { ArrowRight, InfoCircle } from "@tailgrids/icons";
import Link from "next/link";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SaleAttentionItem } from "@/services/api/sale";

import { ATTENTION_PRESENTATION } from "./data";

const attentionStyles = {
  error: { icon: "bg-badge-error-background text-badge-error-text" },
  success: { icon: "bg-badge-success-background text-badge-success-text" },
  warning: { icon: "bg-badge-warning-background text-badge-warning-text" },
};

interface AttentionStudentsProps {
  items: SaleAttentionItem[];
}

export default function AttentionStudents({ items }: AttentionStudentsProps) {
  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Cần chú ý</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Các nhóm hồ sơ cần hành động sớm.</p>
        </div>
        <InfoCircle size={18} className="text-icon-tertiary" aria-label="Phân loại hồ sơ cần chú ý" />
      </CardHeader>

      <div className="mt-5 space-y-2">
        {items.map((item) => {
          const presentation = ATTENTION_PRESENTATION[item.id];
          const styles = attentionStyles[presentation.tone];

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-3"
            >
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
                <span className="text-sm font-bold">{item.count}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-text-primary">{presentation.label}</p>
                </div>
                <p className="mt-0.5 truncate text-[11px] leading-4 text-text-tertiary">{presentation.note}</p>
              </div>
            </div>
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
