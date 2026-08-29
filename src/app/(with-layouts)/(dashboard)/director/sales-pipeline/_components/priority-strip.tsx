import { ArrowRight, InfoTriangle } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";

import { prioritySummary } from "./data";

interface PriorityStripProps {
  onOpenQueue: () => void;
}

export default function PriorityStrip({ onOpenQueue }: PriorityStripProps) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-card-border bg-card-background px-4 py-3 lg:flex-row lg:items-center lg:gap-5" aria-labelledby="priority-heading">
      <div className="flex shrink-0 items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-badge-error-background text-badge-error-text" aria-hidden="true"><InfoTriangle size={15} /></span>
        <div><h2 id="priority-heading" className="text-sm font-semibold text-text-primary">Cần xử lý ngay</h2><p className="text-xs text-error-500">1 hồ sơ quá hạn</p></div>
      </div>
      <div className="hidden h-8 w-px bg-card-border lg:block" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm leading-6 text-text-secondary"><strong className="font-semibold text-text-primary">{prioritySummary[0].count} follow-ups</strong> cần phản hồi · <strong className="font-semibold text-text-primary">{prioritySummary[1].count} lead nóng</strong> đang chờ tư vấn · <strong className="font-semibold text-text-primary">{prioritySummary[2].count} cuộc gọi phụ huynh</strong> trong hôm nay</p>
      <Button appearance="ghost" size="sm" className="shrink-0" onPress={onOpenQueue}>Mở hàng đợi <ArrowRight size={15} /></Button>
    </section>
  );
}
