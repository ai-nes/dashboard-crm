import { ArrowDownward, CheckCircle1, TrendUp2 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { Student360SectionProps } from "./types";

const signals = [
  { label: "Xem trang học phí", detail: "3 lần trong 7 ngày", change: 14 },
  { label: "Tham gia Open Day", detail: "Check-in và hỏi về ngành AI", change: 11 },
  { label: "Phụ huynh hỏi học bổng", detail: "Tín hiệu từ cuộc trò chuyện", change: 9 },
  { label: "Hai cuộc gọi tư vấn", detail: "Phản hồi tích cực", change: 7 },
  { label: "Quan tâm chỉ tiêu ngành", detail: "Đã xem nội dung ngành AI", change: 4 },
  { label: "Chưa mở hồ sơ sau 21 ngày", detail: "Rào cản cần tháo gỡ", change: -6 },
];

export default function StudentSignalCard({ data }: Student360SectionProps) {
  const probability = data.insight.probability;
  const scoreDelta = data.insight.scoreDelta ?? 13;
  const baseline = data.insight.baseline ?? 41;
  const confidence = data.insight.confidence ?? 76;
  const isPriority = probability >= 70;

  return (
    <Card className="p-5">
      <CardHeader className="mb-5">
        <div><CardTitle>Mức độ sẵn sàng nhập học</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Tổng hợp từ tín hiệu hành vi, gia đình và tiến độ hồ sơ.</p></div>
        <Badge color={isPriority ? "success" : "warning"}><TrendUp2 size={13} />{isPriority ? "Ổn định" : "Đang nuôi dưỡng"}</Badge>
      </CardHeader>
      <div className="flex items-end justify-between gap-4"><div><p className="text-4xl leading-none font-semibold tracking-[-1px] text-text-primary">{probability}%</p><p className={`mt-2 text-sm ${scoreDelta >= 0 ? "text-success-500" : "text-error-500"}`}>{scoreDelta > 0 ? "+" : ""}{scoreDelta} điểm trong 7 ngày</p></div><div className="text-right"><p className="text-xs text-text-tertiary">Độ tin cậy</p><p className="mt-1 text-sm font-semibold text-text-primary">{confidence}%</p></div></div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-background-soft-200"><div className="h-full rounded-full bg-success-500" style={{ width: `${probability}%` }} /></div>
      <div className="mt-2 flex justify-between text-xs text-text-tertiary"><span>Điểm bắt đầu {baseline}%</span><span>Ngưỡng ưu tiên 70%</span></div>
      <div className="mt-5 border-t border-card-border pt-4"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold text-text-primary">Tín hiệu đóng góp</p><span className="text-xs text-text-tertiary">6 tín hiệu gần nhất</span></div><ul className="space-y-2.5">{signals.map((signal) => <li key={signal.label} className="flex items-start gap-2.5"><span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${signal.change > 0 ? "bg-badge-success-background text-success-500" : "bg-badge-warning-background text-warning-500"}`} aria-hidden="true">{signal.change > 0 ? <CheckCircle1 size={13} /> : <ArrowDownward size={13} />}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-x-3"><p className="text-sm font-medium text-text-primary">{signal.label}</p><span className={`text-xs font-semibold ${signal.change > 0 ? "text-success-500" : "text-warning-500"}`}>{signal.change > 0 ? "+" : ""}{signal.change} điểm</span></div><p className="mt-0.5 text-xs text-text-tertiary">{signal.detail}</p></div></li>)}</ul></div>
    </Card>
  );
}
