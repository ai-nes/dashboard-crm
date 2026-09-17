import { Badge } from "@/components/tailgrids/core/badge";
import type { SaleTask } from "@/services/api/sale";

import { formatDueTime, formatTaskDeadline } from "./formatters";
import {
  SaleDetailCallout,
  SaleDetailFacts,
  SaleDetailSection,
} from "./sale-detail-primitives";

interface TaskDetailPanelProps {
  task: SaleTask;
  timezone: string;
  referenceDate: string;
}

const taskTypeLabel: Record<SaleTask["type"], string> = {
  call: "Gọi điện",
  document: "Hồ sơ",
  message: "Tin nhắn",
  other: "Công việc khác",
};

const taskStatus: Record<
  SaleTask["status"],
  { label: string; color: "gray" | "sky" | "success" | "warning" }
> = {
  Backlog: { label: "Chưa xếp lịch", color: "gray" },
  Todo: { label: "Chưa làm", color: "warning" },
  "In Progress": { label: "Đang làm", color: "sky" },
  Done: { label: "Hoàn tất", color: "success" },
  Canceled: { label: "Đã hủy", color: "gray" },
};

const taskPriority: Record<
  SaleTask["priority"],
  { label: string; color: "gray" | "warning" | "error" }
> = {
  Low: { label: "Thấp", color: "gray" },
  Medium: { label: "Trung bình", color: "warning" },
  High: { label: "Cao", color: "error" },
};

export default function TaskDetailPanel({
  task,
  timezone,
  referenceDate,
}: TaskDetailPanelProps) {
  const status = taskStatus[task.status];
  const priority = taskPriority[task.priority];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge color={status.color}>{status.label}</Badge>
        <Badge color={priority.color}>
          Ưu tiên {priority.label.toLocaleLowerCase("vi-VN")}
        </Badge>
        <Badge color="gray">{taskTypeLabel[task.type]}</Badge>
      </div>

      {task.isOverdue ? (
        <SaleDetailCallout title="Công việc đã quá hạn" tone="danger">
          Hạn xử lý {formatTaskDeadline(task.dueAt, timezone, referenceDate)}.
          Ưu tiên rà soát hồ sơ và cập nhật tiến độ.
        </SaleDetailCallout>
      ) : null}

      <SaleDetailSection title="Thông tin công việc">
        <SaleDetailFacts
          facts={[
            { label: "Học sinh", value: task.studentName },
            { label: "Mã hồ sơ", value: task.studentId },
            {
              label: "Bắt đầu",
              value: task.startAt
                ? formatDueTime(task.startAt, timezone)
                : "Chưa bắt đầu",
            },
            {
              label: "Hạn xử lý",
              value: formatTaskDeadline(task.dueAt, timezone, referenceDate),
            },
          ]}
        />
      </SaleDetailSection>

      <SaleDetailSection title="Nội dung">
        <p className="rounded-xl border border-card-border bg-background-soft-50 p-4 text-sm leading-6 text-text-secondary">
          {task.context ?? "Chưa có ghi chú cho công việc này."}
        </p>
      </SaleDetailSection>

      <p className="text-xs text-text-tertiary">
        Bảng chi tiết ở chế độ chỉ xem; trạng thái công việc được quản lý tại
        danh sách Công việc.
      </p>
    </div>
  );
}
