import { Badge } from "@/components/tailgrids/core/badge";
import type { TaskReminderSettings } from "@/services/api/task-reminder-settings";
import { formatReminderDate } from "./form-model";

const RUN_STATUS = {
  running: { label: "Đang xử lý", color: "warning" },
  succeeded: { label: "Hoàn tất", color: "success" },
  failed: { label: "Có email gửi lỗi", color: "error" },
} as const;

export default function ReminderStatus({
  settings,
}: {
  settings: TaskReminderSettings;
}) {
  const status = settings.lastRunStatus
    ? RUN_STATUS[settings.lastRunStatus]
    : undefined;
  return (
    <section aria-labelledby="reminder-status-title" className="min-w-0">
      <h2
        id="reminder-status-title"
        className="text-sm font-medium text-text-primary"
      >
        Trạng thái gửi tự động
      </h2>
      <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-text-tertiary">Tự động gửi</dt>
          <dd className="mt-1">
            <Badge color={settings.enabled ? "success" : "gray"}>
              {settings.enabled ? "Đang bật" : "Tạm tắt"}
            </Badge>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-text-tertiary">Lần chạy gần nhất</dt>
          <dd className="mt-1 text-sm font-medium text-text-primary">
            {formatReminderDate(settings.lastRunAt)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-text-tertiary">Kết quả</dt>
          <dd className="mt-1">
            <Badge color={status?.color ?? "gray"}>
              {status?.label ?? "Chưa từng chạy"}
            </Badge>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-text-tertiary">Cập nhật cấu hình</dt>
          <dd className="mt-1 text-sm font-medium text-text-primary">
            {formatReminderDate(settings.updatedAt)}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-5 text-text-tertiary">
        Thời gian hiển thị theo múi giờ Việt Nam.
      </p>
    </section>
  );
}
