"use client";

import { Calendar, CheckCircle1, Sparkle } from "@tailgrids/icons";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { Student360SectionProps } from "./types";

export default function AiInsight({ data }: Student360SectionProps) {
  const { insight } = data;
  return <Card className="min-w-0 p-5 xl:sticky xl:top-5"><CardHeader className="mb-4"><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-badge-primary-background text-badge-primary-text" aria-hidden="true"><Sparkle size={17} /></span><CardTitle>AI Student Insight</CardTitle></div><Badge color="success">High intent</Badge></CardHeader><p className="text-sm leading-6 text-text-secondary">{insight.summary}</p><div className="my-4 grid grid-cols-3 divide-x divide-card-border rounded-lg bg-background-soft-50 py-3 text-center"><div><p className="text-xs text-text-tertiary">Khả năng nhập học</p><p className="mt-1 text-xl font-semibold text-text-primary">{insight.probability}%</p></div><div><p className="text-xs text-text-tertiary">Lo ngại chính</p><p className="mt-1 text-sm font-semibold text-text-primary">Học phí</p></div><div><p className="text-xs text-text-tertiary">Quyết định</p><p className="mt-1 text-sm font-semibold text-text-primary">Phụ huynh</p></div></div><div className="space-y-2.5"><p className="text-xs font-medium text-text-secondary">Bằng chứng chính</p>{insight.evidence.map((item) => <p key={item} className="flex gap-2 text-sm leading-5 text-text-secondary"><CheckCircle1 size={16} className="mt-0.5 shrink-0 text-success-500" aria-hidden="true" />{item}</p>)}</div><div className="mt-5 rounded-lg bg-badge-primary-background p-4"><p className="text-xs font-medium text-badge-primary-text">Hành động đề xuất</p><p className="mt-1 text-sm leading-6 font-semibold text-text-primary">{insight.recommendation}</p><Button className="mt-4 w-full" size="sm" onPress={() => toast.success("Đã tạo lịch nháp tư vấn cùng phụ huynh.")}><Calendar size={16} />Đặt lịch tư vấn</Button></div></Card>;
}
