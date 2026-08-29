"use client";

import { Close, Plus } from "@tailgrids/icons";
import { useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { comparisonMetrics } from "./data";

export default function SegmentComparison() {
  const [isComparisonVisible, setIsComparisonVisible] = useState(true);
  return <Card className="min-w-0 p-0"><CardHeader className="border-b border-card-border p-5"><div><CardTitle>So sánh phân khúc</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Đặt tối đa ba phân khúc cạnh nhau để nhận biết khác biệt đáng ưu tiên.</p></div><Button size="sm" appearance="outline" onPress={() => setIsComparisonVisible((visible) => !visible)}>{isComparisonVisible ? <><Close size={15} />Ẩn đối chiếu</> : <><Plus size={15} />Thêm đối chiếu</>}</Button></CardHeader>{isComparisonVisible ? <div className="p-5"><div className="mb-5 flex flex-wrap items-center gap-2 text-xs"><span className="inline-flex items-center gap-2 rounded-md bg-badge-primary-background px-2.5 py-1.5 font-medium text-badge-primary-text"><span className="size-1.5 rounded-full bg-primary-500" />Nữ · Lớp 12 · Đồng Nai · AI</span><span className="text-text-tertiary">so với</span><span className="inline-flex items-center gap-2 rounded-md border border-card-border px-2.5 py-1.5 text-text-secondary"><span className="size-1.5 rounded-full bg-text-tertiary" />Nam · Lớp 12 · Đồng Nai · AI</span></div><div className="grid divide-y divide-card-border rounded-lg border border-card-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">{comparisonMetrics.map((metric) => <div key={metric.label} className="p-4"><p className="text-xs text-text-tertiary">{metric.label}</p><div className="mt-3 flex items-baseline justify-between gap-3"><strong className="text-lg text-text-primary">{metric.primary}</strong><span className="text-sm text-text-tertiary">{metric.secondary}</span></div><div className="mt-2 space-y-1"><div className="h-1.5 overflow-hidden rounded-full bg-background-soft-200"><div className="h-full rounded-full bg-primary-500" style={{ width: `${metric.primaryWidth}%` }} /></div><div className="h-1.5 overflow-hidden rounded-full bg-background-soft-200"><div className="h-full rounded-full bg-text-tertiary" style={{ width: `${metric.secondaryWidth}%` }} /></div></div></div>)}</div></div> : <div className="p-5 text-sm text-text-secondary">Thêm một phân khúc để so sánh các chỉ số chuyển đổi quan trọng.</div>}</Card>;
}
