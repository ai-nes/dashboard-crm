"use client";

import { Calendar, CheckCircle1, Sparkle } from "@tailgrids/icons";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { Student360SectionProps } from "./types";

export default function AiInsight({ data }: Student360SectionProps) {
  const { insight } = data;
  const isPriority = insight.probability >= 70;

  return (
    <Card className="relative flex h-full min-w-0 flex-col overflow-hidden p-0">
      <div className="p-5 pb-4 pl-6">
        <CardHeader className="mb-4">
          <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-card-background text-brand-500" aria-hidden="true"><Sparkle size={18} /></span><div><CardTitle>Khuyến nghị ưu tiên</CardTitle><p className="mt-0.5 text-xs text-text-secondary">Tóm tắt để chọn đúng hành động tiếp theo.</p></div></div>
          <Badge color={isPriority ? "success" : "warning"}>{isPriority ? "Hành động ngay" : "Cần nuôi dưỡng"}</Badge>
        </CardHeader>
        <p className="max-w-2xl text-sm leading-6 text-text-secondary">{insight.summary}</p>
      </div>

      <div className="flex flex-1 flex-col p-5 pt-1 pl-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-warning-500/30 bg-badge-warning-background p-4"><p className="text-[11px] font-semibold tracking-wide text-badge-warning-text uppercase">Rào cản cần tháo gỡ</p><p className="mt-1 text-base font-semibold text-text-primary">{insight.concern}</p></div>
          <div className="rounded-xl border border-primary-200 bg-badge-primary-background p-4"><p className="text-[11px] font-semibold tracking-wide text-badge-primary-text uppercase">Người ảnh hưởng quyết định</p><p className="mt-1 text-base font-semibold text-text-primary">{insight.decisionMaker.split(" · ")[0]}</p><p className="mt-1 text-xs text-text-secondary">Cửa sổ hành động: 48 giờ tới</p></div>
        </div>

        <div className="mt-5 border-t border-card-border pt-4">
          <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-text-primary">Bằng chứng đáng tin cậy</p><span className="text-xs text-text-tertiary">3 tín hiệu chính</span></div>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-3">{insight.evidence.slice(0, 3).map((item) => <li key={item} className="flex gap-2 text-sm leading-5 text-text-secondary"><CheckCircle1 size={16} className="mt-0.5 shrink-0 text-success-500" aria-hidden="true" />{item}</li>)}</ul>
        </div>

        <div className="mt-auto pt-5"><div className="flex min-h-24 flex-col gap-4 rounded-xl border border-card-border bg-background-gray-primary p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="text-[11px] font-semibold tracking-wide text-brand-500 uppercase">Hành động ưu tiên</p><p className="mt-1 text-sm leading-6 font-semibold text-text-primary">{insight.recommendation}</p></div><Button className="shrink-0" size="sm" onPress={() => toast.success("Đã tạo lịch nháp tư vấn cùng phụ huynh.")}><Calendar size={16} />Đặt lịch</Button></div></div>
      </div>
    </Card>
  );
}
