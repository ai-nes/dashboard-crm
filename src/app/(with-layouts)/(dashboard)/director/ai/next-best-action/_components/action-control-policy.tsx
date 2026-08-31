import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

const policyRows = [
  { label: "Tự động", color: "success" as const, detail: "Nhắc lịch và cập nhật nội bộ", action: "Hệ thống thực hiện" },
  { label: "Cần kiểm tra", color: "primary" as const, detail: "Giao việc, đặt lịch, mời sự kiện", action: "Kiểm tra trước khi gửi" },
  { label: "Cần duyệt", color: "error" as const, detail: "Gửi nội dung cho học sinh hoặc phụ huynh", action: "Người phụ trách xác nhận" },
];

export default function ActionControlPolicy() {
  return (
    <Card className="min-w-0 p-5">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Quy tắc thực hiện</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Việc càng tác động trực tiếp càng cần người xác nhận.</p>
        </div>
      </CardHeader>

      <div className="divide-y divide-card-border">
        {policyRows.map((row) => (
          <div key={row.label} className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start sm:gap-3">
            <Badge color={row.color}>{row.label}</Badge>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">{row.detail}</p>
              <p className="mt-1 text-xs text-text-tertiary">{row.action}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
