"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import type {
  CRMTask,
  CRMTaskPriority,
  CRMTaskStatus,
} from "@/services/api/crm-tasks";
import { CRM_TASK_STATUS_LABEL } from "@/services/api/crm-tasks";
import type { SessionUser } from "@/services/api/auth";

export interface SegmentTaskFormValues {
  title: string;
  description: string;
  priority: CRMTaskPriority;
  status: CRMTaskStatus;
  startDate: string;
  dueDate: string;
  assignedTo: string;
}

interface SegmentTaskDialogProps {
  isOpen: boolean;
  task: CRMTask | null;
  assignees: SessionUser[];
  isLoadingAssignees?: boolean;
  assigneesError?: Error | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SegmentTaskFormValues) => void | Promise<void>;
}

const UNASSIGNED_ID = "__unassigned__";

const STATUS_OPTIONS: Array<{ value: CRMTaskStatus; label: string }> = [
  { value: "Todo", label: CRM_TASK_STATUS_LABEL.Todo },
  { value: "Backlog", label: CRM_TASK_STATUS_LABEL.Backlog },
  { value: "In Progress", label: CRM_TASK_STATUS_LABEL["In Progress"] },
  { value: "Done", label: CRM_TASK_STATUS_LABEL.Done },
  { value: "Canceled", label: CRM_TASK_STATUS_LABEL.Canceled },
];

const PRIORITY_OPTIONS: Array<{
  value: CRMTaskPriority;
  label: string;
}> = [
  { value: "High", label: "Cao" },
  { value: "Medium", label: "Trung bình" },
  { value: "Low", label: "Thấp" },
];

function toDateInputValue(value?: string): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);

  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
}

function valuesFromTask(task: CRMTask | null): SegmentTaskFormValues {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? "Medium",
    status: task?.status ?? "Todo",
    startDate: toDateInputValue(task?.startDate),
    dueDate: toDateInputValue(task?.dueDate),
    assignedTo: task?.assignedTo ?? "",
  };
}

function assigneeLabel(user: SessionUser): string {
  return user.full_name?.trim() || user.email || user.name;
}

export default function SegmentTaskDialog({
  isOpen,
  task,
  assignees,
  isLoadingAssignees = false,
  assigneesError = null,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: SegmentTaskDialogProps) {
  const [values, setValues] = useState<SegmentTaskFormValues>(() =>
    valuesFromTask(task),
  );

  const assigneeOptions = useMemo(() => {
    if (
      !task?.assignedTo ||
      assignees.some((user) => user.name === task.assignedTo)
    ) {
      return assignees;
    }

    const currentAssignee: SessionUser = {
      name: task.assignedTo,
      email: task.assignedTo,
      full_name: task.assignedTo,
      roles: [],
      crm_profile: null,
    };
    return [currentAssignee, ...assignees];
  }, [assignees, task]);

  const title = task ? "Chỉnh sửa task" : "Tạo task";
  const setValue = <K extends keyof SegmentTaskFormValues>(
    field: K,
    value: SegmentTaskFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.title.trim() || isSubmitting) return;

    await onSubmit({ ...values, title: values.title.trim() });
  };

  const handleOpenChange = (open: boolean) => {
    if (open || !isSubmitting) onOpenChange(open);
  };

  return (
    <Backdrop
      isOpen={isOpen}
      isDismissable={!isSubmitting}
      onOpenChange={handleOpenChange}
    >
      <Dialog
        aria-label={title}
        showCloseButton={false}
        className="max-h-[calc(100vh-2rem)] max-w-2xl overflow-hidden p-0 max-sm:max-w-[calc(100%-2rem)]"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-card-border px-6 py-5">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="text-text-tertiary">
              Theo dõi công việc được gắn với segment này.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="max-h-[calc(100vh-12rem)] space-y-5 overflow-y-auto px-6 py-5">
            <div className="space-y-2">
              <label
                htmlFor="segment-task-title"
                className="text-sm font-medium text-input-label-text"
              >
                Tiêu đề task <span className="text-input-error">*</span>
              </label>
              <Input
                id="segment-task-title"
                value={values.title}
                onChange={(event) => setValue("title", event.target.value)}
                placeholder="Ví dụ: Gọi lại nhóm học sinh quan tâm học phí"
                required
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="segment-task-description"
                className="text-sm font-medium text-input-label-text"
              >
                Mô tả
              </label>
              <textarea
                id="segment-task-description"
                value={values.description}
                onChange={(event) =>
                  setValue("description", event.target.value)
                }
                placeholder="Ghi chú thêm cho người thực hiện…"
                rows={4}
                disabled={isSubmitting}
                className="w-full resize-y rounded-lg border border-card-border bg-input-background px-4 py-3 text-sm text-title-50 outline-none placeholder:text-input-placeholder-text focus:border-input-primary-focus-border focus:ring-4 focus:ring-input-primary-focus-border/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                value={values.status}
                onChange={(value) =>
                  setValue("status", String(value) as CRMTaskStatus)
                }
                isDisabled={isSubmitting}
              >
                <SelectLabel>Trạng thái</SelectLabel>
                <SelectTrigger>
                  <SelectValue />
                  <SelectIndicator />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      id={option.value}
                      textValue={option.label}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={values.priority}
                onChange={(value) =>
                  setValue("priority", String(value) as CRMTaskPriority)
                }
                isDisabled={isSubmitting}
              >
                <SelectLabel>Mức ưu tiên</SelectLabel>
                <SelectTrigger>
                  <SelectValue />
                  <SelectIndicator />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      id={option.value}
                      textValue={option.label}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="segment-task-start-date"
                  className="text-sm font-medium text-input-label-text"
                >
                  Ngày bắt đầu
                </label>
                <Input
                  id="segment-task-start-date"
                  type="date"
                  value={values.startDate}
                  onChange={(event) =>
                    setValue("startDate", event.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="segment-task-due-date"
                  className="text-sm font-medium text-input-label-text"
                >
                  Hạn xử lý
                </label>
                <Input
                  id="segment-task-due-date"
                  type="date"
                  value={values.dueDate}
                  onChange={(event) => setValue("dueDate", event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <Select
              value={values.assignedTo || UNASSIGNED_ID}
              onChange={(value) =>
                setValue(
                  "assignedTo",
                  String(value) === UNASSIGNED_ID ? "" : String(value),
                )
              }
              isDisabled={isSubmitting || isLoadingAssignees}
            >
              <SelectLabel>Người phụ trách</SelectLabel>
              <SelectTrigger>
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                <SelectItem id={UNASSIGNED_ID} textValue="Chưa phân công">
                  Chưa phân công
                </SelectItem>
                {assigneeOptions.map((user) => (
                  <SelectItem
                    key={user.name}
                    id={user.name}
                    textValue={assigneeLabel(user)}
                  >
                    {assigneeLabel(user)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isLoadingAssignees && (
              <p className="-mt-3 text-xs text-text-tertiary">
                Đang tải danh sách người phụ trách…
              </p>
            )}
            {assigneesError && (
              <p className="-mt-3 text-xs text-input-error" role="alert">
                Không thể tải danh sách người phụ trách:{" "}
                {assigneesError.message}
              </p>
            )}
          </DialogBody>

          <DialogFooter className="border-t border-card-border px-6 py-4">
            <Button
              type="button"
              appearance="outline"
              isDisabled={isSubmitting}
              onPress={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              isDisabled={!values.title.trim() || isSubmitting}
            >
              {isSubmitting ? "Đang lưu…" : task ? "Lưu thay đổi" : "Tạo task"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Backdrop>
  );
}
