"use client";

import { CheckCircle1, ClockThree, FileText } from "@tailgrids/icons";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import { documents } from "./student-tab-data";
import type { Student360SectionProps } from "./types";

export default function StudentDocumentsTab({ data }: Student360SectionProps) {
  const completed = documents.filter((item) => item.tone === "success").length;

  return <div className="h-full"><Card className="flex h-full flex-col p-5"><CardHeader className="mb-5"><div><CardTitle>Tài liệu hồ sơ</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Tài liệu của {data.student.name} trong quy trình ứng tuyển.</p></div><Button size="sm" appearance="outline" onPress={() => toast.success("Đã mở luồng tải tài liệu mô phỏng.")}><FileText size={16} />Thêm tài liệu</Button></CardHeader><div className="mb-5 flex flex-col gap-3 rounded-lg border border-info-500/20 bg-badge-sky-background p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-text-primary">Tiến độ tài liệu</p><p className="mt-1 text-xs text-text-secondary">{completed}/5 tài liệu đã có trong hồ sơ</p></div><div className="flex items-center gap-3 sm:min-w-60"><div className="h-2 flex-1 overflow-hidden rounded-full bg-card-background"><div className="h-full rounded-full bg-success-500" style={{ width: `${(completed / documents.length) * 100}%` }} /></div><span className="text-sm font-semibold text-text-primary">{completed * 20}%</span></div></div><ul className="divide-y divide-card-border">{documents.map((document) => <li key={document.name} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-start gap-3"><span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${document.tone === "success" ? "bg-badge-success-background text-success-500" : document.tone === "warning" ? "bg-badge-warning-background text-warning-500" : "border border-card-border bg-card-background text-text-tertiary"}`} aria-hidden="true">{document.tone === "success" ? <CheckCircle1 size={17} /> : document.tone === "warning" ? <ClockThree size={17} /> : <FileText size={17} />}</span><div className="min-w-0"><p className="truncate text-sm font-medium text-text-primary">{document.name}</p><p className="mt-1 text-xs text-text-tertiary">{document.type} · {document.date}</p></div></div><Badge color={document.tone}>{document.status}</Badge></li>)}</ul></Card></div>;
}
