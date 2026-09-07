"use client";

import { useState, type ReactNode } from "react";

import { Button } from "@/components/tailgrids/core/button";
import type {
  StudentPriority,
  StudentTaskItem,
} from "@/services/api/students/types";

import TaskDialogHeader from "./task-dialog-header";
import TaskDialogTitle from "./task-dialog-title";
import TaskDialogDescription from "./task-dialog-description";
import TaskDialogSidebar from "./task-dialog-sidebar";

export interface TaskCreateFormValues {
  title: string;
  status: StudentTaskItem["status"];
  dueDate: string;
  dueTime: string;
  actionCode: string;
  priority: StudentPriority;
  notes: string;
}

interface TaskCreateFormProps {
  contextLabel: string;
  heading: string;
  studentField: ReactNode;
  assigneeName: string;
  externalValid?: boolean;
  initialDueDate?: string;
  initialDueTime?: string;
  isSubmitting?: boolean;
  onSubmit: (values: TaskCreateFormValues) => void | Promise<void>;
  onCancel: () => void;
}

function getTodayInputValue(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

export default function TaskCreateForm({
  contextLabel,
  heading,
  studentField,
  assigneeName,
  externalValid = true,
  initialDueDate = getTodayInputValue(),
  initialDueTime = "09:00",
  isSubmitting = false,
  onSubmit,
  onCancel,
}: TaskCreateFormProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<StudentTaskItem["status"]>("todo");
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [dueTime, setDueTime] = useState(initialDueTime);
  const [actionCode, setActionCode] = useState("CREATE_TASK");
  const [priority, setPriority] = useState<StudentPriority>("Trung bình");
  const [notes, setNotes] = useState("");

  const isValid = Boolean(
    externalValid && title.trim() && dueDate && dueTime && actionCode,
  );

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    await onSubmit({
      title: title.trim(),
      status,
      dueDate,
      dueTime,
      actionCode,
      priority,
      notes,
    });

    setTitle("");
    setStatus("todo");
    setDueDate(initialDueDate);
    setDueTime(initialDueTime);
    setActionCode("CREATE_TASK");
    setPriority("Trung bình");
    setNotes("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background-white-primary">
      {/* Header gọn gàng */}
      <TaskDialogHeader
        breadcrumbContext={contextLabel}
        taskKey={heading}
        onClose={onCancel}
      />

      {/* Body phân 2 cột chuẩn Jira với thanh cuộn độc lập */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid min-h-full lg:grid-cols-[minmax(0,1fr)_21rem]">
          {/* Cột trái: Tiêu đề + Ghi chú task */}
          <div className="flex min-h-full min-w-0 flex-col space-y-6 p-5 sm:p-7">
            <TaskDialogTitle
              value={title}
              onChange={setTitle}
              placeholder="Tên task..."
              className="shrink-0"
            />

            <TaskDialogDescription
              value={notes}
              onChange={setNotes}
              placeholder="Mô tả chi tiết công việc cần làm..."
            />
          </div>

          {/* Cột phải: Sidebar thuộc tính CRM thực tế */}
          <div className="border-t border-card-border bg-background-soft-50/30 p-5 lg:border-t-0 lg:border-l">
            <TaskDialogSidebar
              status={status}
              onStatusChange={setStatus}
              assigneeName={assigneeName}
              parentField={studentField}
              priority={priority}
              onPriorityChange={setPriority}
              actionCode={actionCode}
              onActionCodeChange={setActionCode}
              dueDate={dueDate}
              onDueDateChange={setDueDate}
              dueTime={dueTime}
              onDueTimeChange={setDueTime}
            />
          </div>
        </div>
      </div>

      {/* Footer hành động */}
      <footer className="flex shrink-0 items-center justify-between border-t border-card-border bg-background-white-primary px-5 py-3 sm:px-6">
        <div className="text-xs text-text-tertiary">
          {!title.trim() && "Vui lòng nhập tên task để tạo."}
        </div>
        <div className="flex items-center gap-2">
          <Button
            appearance="outline"
            variant="ghost"
            size="sm"
            onPress={onCancel}
          >
            Hủy
          </Button>
          <Button
            size="sm"
            onPress={handleSubmit}
            isDisabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : "Tạo task"}
          </Button>
        </div>
      </footer>
    </div>
  );
}
