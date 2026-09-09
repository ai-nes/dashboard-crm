import { Badge } from "@/components/tailgrids/core/badge";
import type { ActivityLogEntry } from "@/services/api/activity-log";
import { formatDateTime } from "@/utils/format-date";

interface ActivityLogListProps {
  logs: ActivityLogEntry[];
  isLoading: boolean;
  error: Error | null;
  tracked: boolean;
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "Không có";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function ActivityLogList({
  logs,
  isLoading,
  error,
  tracked,
}: ActivityLogListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-label="Đang tải nhật ký" aria-busy="true">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-16 animate-pulse rounded-lg bg-background-gray-secondary" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg bg-error-50 p-4 text-sm text-error-600">
        Không thể tải nhật ký: {error.message}
      </p>
    );
  }

  if (!tracked && logs.length === 0) {
    return (
      <p className="rounded-lg bg-background-gray-secondary p-8 text-center text-sm text-text-secondary">
        Chưa bật audit trail cho dữ liệu này.
      </p>
    );
  }

  if (logs.length === 0) {
    return (
      <p className="rounded-lg bg-background-gray-secondary p-8 text-center text-sm text-text-secondary">
        Không có hoạt động nào trong khoảng thời gian đã chọn.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-card-border bg-card-background">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-card-border bg-background-gray-secondary text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            <tr>
              <th className="px-4 py-3">Thời điểm</th>
              <th className="px-4 py-3">Người thực hiện</th>
              <th className="px-4 py-3">Hoạt động</th>
              <th className="px-4 py-3">Thay đổi</th>
              <th className="px-4 py-3">Mức độ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {logs.map((log) => (
              <tr key={log.eventId} className="align-top hover:bg-background-gray-secondary/60">
                <td className="whitespace-nowrap px-4 py-4 text-text-secondary">
                  <time dateTime={log.occurredAt}>{formatDateTime(log.occurredAt)}</time>
                </td>
                <td className="px-4 py-4">
                  <div className="font-medium text-text-primary">{log.ownerFullName || "Không xác định"}</div>
                  <div className="mt-0.5 text-xs text-text-tertiary">{log.owner || "Không có tài khoản"}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-medium text-text-primary">{log.action}</div>
                  <div className="mt-0.5 text-xs text-text-tertiary">{log.eventType || log.category} · {log.doctype} / {log.docname}</div>
                </td>
                <td className="max-w-80 px-4 py-4 text-xs">
                  {log.fieldLabel && <div className="mb-1 font-medium text-text-secondary">{log.fieldLabel}</div>}
                  <div className="break-words text-text-tertiary">{displayValue(log.oldValue)} <span aria-hidden="true">→</span> {displayValue(log.newValue)}</div>
                </td>
                <td className="px-4 py-4">
                  <Badge color={log.severity === "critical" ? "warning" : "gray"}>
                    {log.severity === "critical" ? "Cần chú ý" : "Thông tin"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
