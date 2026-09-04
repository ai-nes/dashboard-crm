"use client";

import { CheckCircle1, ClockThree, FileText } from "@tailgrids/icons";
import { toast } from "sonner";

import { AccordionContent, AccordionItem, AccordionRoot, AccordionTrigger } from "@/components/tailgrids/core/accordion";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { formatDateTime } from "@/utils/format-date";

import { documents } from "./student-tab-data";
import type { Student360SectionProps } from "./types";

export default function StudentDocumentsTab({ data }: Student360SectionProps) {
  const docList = data.documents ?? documents;
  const completed = docList.filter((item) => item.tone === "success").length;
  const totalDocs = docList.length;
  const percentage = totalDocs > 0 ? Math.round((completed / totalDocs) * 100) : 0;
  const deadline = data.application.find((item) => item.label === "Hạn hoàn tất")?.value;

  return (
    <Card className="flex h-full flex-col p-5">
      <CardHeader className="mb-5">
        <CardTitle>Tài liệu</CardTitle>
        <Button size="sm" appearance="outline" onPress={() => toast.success("Đã mở form tải tài liệu.")}><FileText size={16} />Thêm tài liệu</Button>
      </CardHeader>

      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-info-500/20 bg-badge-sky-background p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">Tiến độ</p>
          <p className="mt-1 text-xs text-text-secondary">{completed}/{totalDocs} tài liệu{deadline ? ` · Hạn hoàn tất: còn ${deadline.replace(/^Còn\s*/i, "")}` : ""}</p>
        </div>
        <div className="flex items-center gap-3 sm:min-w-60">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-card-background"><div className="h-full rounded-full bg-success-500" style={{ width: `${percentage}%` }} /></div>
          <span className="text-sm font-semibold text-text-primary">{percentage}%</span>
        </div>
      </div>

      {docList.length === 0 && (
        <p className="py-6 text-center text-sm text-text-tertiary">Chưa có dữ liệu tài liệu.</p>
      )}

      <AccordionRoot variant="style_two" className="gap-0">
        {docList.map((document) => {
          const hasFile = document.tone === "success";
          const icon = document.tone === "success" ? <CheckCircle1 size={17} /> : document.tone === "warning" ? <ClockThree size={17} /> : <FileText size={17} />;
          const row = (
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${document.tone === "success" ? "bg-badge-success-background text-success-500" : document.tone === "warning" ? "bg-badge-warning-background text-warning-500" : "border border-card-border bg-card-background text-text-tertiary"}`} aria-hidden="true">{icon}</span>
              <div className="min-w-0"><p className="truncate text-sm font-medium text-text-primary">{document.name}</p><p className="mt-1 text-xs text-text-tertiary">{document.type} · {formatDateTime(document.date)}</p></div>
            </div>
          );

          if (!hasFile) {
            return <div key={document.name} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">{row}<Badge className="self-start sm:self-auto" color={document.tone}>{document.status}</Badge></div>;
          }

          return (
            <AccordionItem key={document.name} className="border-0 bg-transparent">
              <AccordionTrigger className="items-center px-0 py-4 first:pt-0 hover:no-underline">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:pr-2">{row}<Badge className="self-start sm:self-auto" color={document.tone}>{document.status}</Badge></div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-4">
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-card-border bg-background-gray-primary p-6 text-center">
                  <FileText size={28} className="text-icon-tertiary" aria-hidden="true" />
                  <p className="text-sm font-medium text-text-primary">{document.name}</p>
                  <Button size="xs" appearance="outline" onPress={() => toast.info(`Đang mở ${document.name}.`)}>Mở file</Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </AccordionRoot>
    </Card>
  );
}
