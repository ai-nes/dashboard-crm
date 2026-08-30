import { CheckCircle1, ClockThree } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

const auditEvents = [
  { actor: "Trần Quốc Bảo", action: "Cập nhật trạng thái hồ sơ", time: "06/06 · 17:05", status: "Đã lưu", tone: "success" as const },
  { actor: "Hệ thống", action: "Cập nhật điểm tín hiệu", time: "06/06 · 08:00", status: "Đã ghi nhận", tone: "primary" as const },
  { actor: "Đồng bộ sự kiện", action: "Ghi nhận điểm chạm Open Day", time: "02/06 · 09:30", status: "Đã đồng bộ", tone: "success" as const },
  { actor: "Career Talk", action: "Khởi tạo hồ sơ học sinh", time: "28/05 · 14:05", status: "Đã xác thực", tone: "success" as const },
];

export default function StudentAuditCard() {
  return <Card className="p-5"><CardHeader className="mb-4"><CardTitle>Nhật ký xử lý</CardTitle><Badge color="primary">Đã kiểm soát</Badge></CardHeader><ul className="divide-y divide-card-border">{auditEvents.map((event) => <li key={`${event.actor}-${event.time}`} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3 first:pt-0 last:pb-0"><span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${event.tone === "success" ? "bg-badge-success-background text-success-500" : "bg-badge-primary-background text-badge-primary-text"}`} aria-hidden="true">{event.tone === "success" ? <CheckCircle1 size={14} /> : <ClockThree size={14} />}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-text-primary">{event.action}</p><p className="mt-0.5 text-xs text-text-tertiary">{event.actor} · {event.time}</p></div><Badge color={event.tone}>{event.status}</Badge></li>)}</ul></Card>;
}
