import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { Student360SectionProps } from "./types";

const statusColor = { success: "success", warning: "warning", primary: "primary" } as const;

export default function ApplicationCard({ data }: Student360SectionProps) {
  const applicationStatus = data.application.find((item) => item.label === "Trạng thái hồ sơ")?.value ?? "Chưa bắt đầu · 0/5 tài liệu";
  const deadline = data.application.find((item) => item.label === "Hạn hoàn tất")?.value ?? "Còn 12 ngày";
  const completedDocuments = Number(applicationStatus.match(/(\d)\/5/)?.[1] ?? 0);
  const complete = completedDocuments === 5;

  return (
    <Card className={`flex h-full flex-col p-5 ${complete ? "border-success-500/30" : "border-warning-500/30"}`}>
      <CardHeader className="mb-5">
        <div><CardTitle>Hồ sơ ứng tuyển</CardTitle><p className="mt-1 text-xs text-text-secondary">Điểm nghẽn trước khi chuyển sang bước nộp hồ sơ.</p></div>
        <div className="text-right"><p className="text-xs text-text-tertiary">Thời gian còn lại</p><p className={`mt-1 text-2xl font-semibold ${complete ? "text-success-500" : "text-warning-500"}`}>{deadline.replace("Còn ", "")}</p></div>
      </CardHeader>
      <dl className="divide-y divide-card-border">{data.application.map((item) => <div key={item.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><dt className="text-sm text-text-secondary">{item.label}</dt><dd>{item.status ? <Badge color={statusColor[item.status]}>{item.value}</Badge> : <span className="text-sm font-medium text-text-primary">{item.value}</span>}</dd></div>)}</dl>
    </Card>
  );
}
