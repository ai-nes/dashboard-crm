import { Badge } from "@/components/tailgrids/core/badge";
import { Pagination } from "@/components/tailgrids/core/pagination";
import type { ActivityLogEntry } from "@/services/api/activity-log";
import { formatDateTime } from "@/utils/format-date";

import ActivityLogDiff from "./activity-log-diff";
import {
  getActivityTitle,
  getDoctypeLabel,
  getEventTechnicalLabel,
  getFieldLabel,
  getInitials,
} from "./activity-log-utils";

interface ActivityLogListProps {
  logs: ActivityLogEntry[];
  isLoading: boolean;
  error: Error | null;
  tracked: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isDisabled: boolean;
  onSelectLog: (log: ActivityLogEntry) => void;
}

export default function ActivityLogList({
  logs,
  isLoading,
  error,
  tracked,
  currentPage,
  totalPages,
  onPageChange,
  isDisabled,
  onSelectLog,
}: ActivityLogListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-label="Đang tải nhật ký" aria-busy="true">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-24 animate-pulse rounded-lg bg-background-gray-secondary"
          />
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
    <>
      <div className="hidden overflow-hidden rounded-xl border border-card-border bg-card-background lg:block">
        <div className="flex items-center justify-between gap-4 border-b border-card-border px-4 py-3 sm:px-5">
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Hoạt động gần đây
            </p>
            <p className="mt-0.5 text-xs text-text-tertiary">
              Chọn một dòng để xem đầy đủ thông tin audit.
            </p>
          </div>
          <span className="shrink-0 text-xs text-text-tertiary">
            {logs.length} bản ghi trong trang
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] text-left text-sm">
            <thead className="border-b border-card-border bg-background-gray-secondary text-xs font-semibold text-text-tertiary">
              <tr>
                <th className="w-40 px-4 py-3">Thời điểm</th>
                <th className="w-56 px-4 py-3">Người thực hiện</th>
                <th className="min-w-72 px-4 py-3">Sự kiện</th>
                <th className="min-w-80 px-4 py-3">Thay đổi</th>
                <th className="w-32 px-4 py-3">Mức độ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {logs.map((log) => (
                <tr
                  key={log.eventId}
                  role="button"
                  tabIndex={0}
                  aria-label={`Xem chi tiết: ${getActivityTitle(log)}`}
                  onClick={() => onSelectLog(log)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectLog(log);
                    }
                  }}
                  className="cursor-pointer align-top outline-none transition-colors hover:bg-background-gray-secondary/60 focus-visible:bg-background-gray-secondary/60"
                >
                  <td className="whitespace-nowrap px-4 py-4 text-text-secondary">
                    <time dateTime={log.occurredAt}>
                      {formatDateTime(log.occurredAt)}
                    </time>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-2.5">
                      <span
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background-gray-secondary text-[11px] font-semibold text-text-secondary"
                        aria-hidden="true"
                      >
                        {getInitials(log.ownerFullName || log.owner)}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-text-primary">
                          {log.ownerFullName || "Không xác định"}
                        </div>
                        <div className="mt-0.5 truncate text-xs text-text-tertiary">
                          {log.owner || "Không có tài khoản"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-text-primary">
                      {getActivityTitle(log)}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-text-secondary">
                      <span>{getDoctypeLabel(log.doctype)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="break-all font-mono text-text-tertiary">
                        {log.docname}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-text-tertiary">
                      {getEventTechnicalLabel(log)}
                    </div>
                  </td>
                  <td className="max-w-96 px-4 py-4">
                    <div className="mb-2 text-xs font-medium text-text-secondary">
                      {getFieldLabel(log)}
                    </div>
                    <ActivityLogDiff
                      oldValue={log.oldValue}
                      newValue={log.newValue}
                      compact
                    />
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      color={log.severity === "critical" ? "warning" : "gray"}
                      prefixIcon={
                        <span
                          className="size-1.5 rounded-full bg-current"
                          aria-hidden="true"
                        />
                      }
                    >
                      {log.severity === "critical" ? "Cần chú ý" : "Thông tin"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="space-y-3 lg:hidden"
        aria-label="Danh sách nhật ký hoạt động"
      >
        <div className="flex items-center justify-between gap-4 px-1">
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Hoạt động gần đây
            </p>
            <p className="mt-0.5 text-xs text-text-tertiary">
              Chạm vào một dòng để xem chi tiết.
            </p>
          </div>
          <span className="shrink-0 text-xs text-text-tertiary">
            {logs.length} bản ghi
          </span>
        </div>

        {logs.map((log) => (
          <button
            key={log.eventId}
            type="button"
            onClick={() => onSelectLog(log)}
            className="block w-full rounded-xl border border-card-border bg-card-background p-4 text-left outline-none transition-colors hover:bg-background-gray-secondary/60 focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2.5">
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background-gray-secondary text-[11px] font-semibold text-text-secondary"
                  aria-hidden="true"
                >
                  {getInitials(log.ownerFullName || log.owner)}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-text-primary">
                    {log.ownerFullName || "Không xác định"}
                  </p>
                  <p className="truncate text-xs text-text-tertiary">
                    {log.owner || "Không có tài khoản"}
                  </p>
                </div>
              </div>
              <time
                className="shrink-0 text-right text-xs text-text-secondary"
                dateTime={log.occurredAt}
              >
                {formatDateTime(log.occurredAt)}
              </time>
            </div>

            <div className="mt-4 border-t border-card-border pt-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary">
                    {getActivityTitle(log)}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {getDoctypeLabel(log.doctype)} ·{" "}
                    <span className="font-mono">{log.docname}</span>
                  </p>
                </div>
                <Badge
                  color={log.severity === "critical" ? "warning" : "gray"}
                  prefixIcon={
                    <span
                      className="size-1.5 rounded-full bg-current"
                      aria-hidden="true"
                    />
                  }
                >
                  {log.severity === "critical" ? "Cần chú ý" : "Thông tin"}
                </Badge>
              </div>
              <div className="mt-3 rounded-lg bg-background-gray-secondary/60 p-3">
                <p className="mb-2 text-xs font-medium text-text-secondary">
                  {getFieldLabel(log)}
                </p>
                <ActivityLogDiff
                  oldValue={log.oldValue}
                  newValue={log.newValue}
                  compact
                />
              </div>
            </div>
          </button>
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="flex justify-end border-t border-card-border px-5 py-4">
          <div className="w-fit">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              variant="compact"
              isDisabled={isDisabled}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
