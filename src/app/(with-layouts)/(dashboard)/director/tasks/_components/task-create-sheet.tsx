"use client";

import { useId, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { RichTextEditor } from "@/components/tailgrids/core/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import {
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
} from "@/components/tailgrids/core/sheet";
import { TextField } from "@/components/tailgrids/core/text-field";
import { useAuth } from "@/components/common/auth/auth-provider";
import type {
  StudentListItem,
  StudentPriority,
  StudentTaskType,
} from "@/services/api/students/types";
import type { TaskManagementItem } from "@/services/api/tasks/types";

import { taskTypeLabel } from "../../students/_components/student-task-badges";
import TaskStudentSelect from "./task-student-select";

interface TaskCreateSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentListItem[];
  onCreate: (task: TaskManagementItem) => void | Promise<void>;
  isLoadingStudents?: boolean;
  studentsError?: Error | null;
  isSubmitting?: boolean;
  requireAssignee?: boolean;
  assigneeId?: string;
  assigneeName?: string;
}

const priorityOptions: StudentPriority[] = ["Cao", "Trung bình", "Thấp"];
const taskTypeOptions: StudentTaskType[] = ["call", "email", "todo"];

function getTodayInputValue(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

export default function TaskCreateSheet({
  isOpen,
  onOpenChange,
  students,
  onCreate,
  isLoadingStudents = false,
  studentsError = null,
  isSubmitting = false,
  requireAssignee = false,
  assigneeId: assigneeIdProp,
  assigneeName: assigneeNameProp,
}: TaskCreateSheetProps) {
  const formId = useId();
  const { user } = useAuth();
  const assigneeName = assigneeNameProp || user?.full_name || "-";
  const assigneeId = assigneeIdProp || user?.user || user?.email;
  const [title, setTitle] = useState("");
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [dueDate, setDueDate] = useState(getTodayInputValue);
  const [dueTime, setDueTime] = useState("09:00");
  const [taskType, setTaskType] = useState<StudentTaskType>("todo");
  const [priority, setPriority] = useState<StudentPriority>("Trung bình");
  const [notes, setNotes] = useState("");

  const selectedStudentId = students.some((item) => item.id === studentId)
    ? studentId
    : (students[0]?.id ?? "");
  const student = students.find((item) => item.id === selectedStudentId);
  const isValid = Boolean(
    student &&
    title.trim() &&
    dueDate &&
    dueTime &&
    (!requireAssignee || assigneeId),
  );

  const resetForm = () => {
    setTitle("");
    setStudentId(students[0]?.id ?? "");
    setDueDate(getTodayInputValue());
    setDueTime("09:00");
    setTaskType("todo");
    setPriority("Trung bình");
    setNotes("");
  };

  const handleSubmit = async () => {
    if (!isValid || !student || isSubmitting) return;

    try {
      await onCreate({
        id: `task-new-${formId}-${Date.now()}`,
        title: title.trim(),
        assignee: assigneeName,
        assigneeId,
        dueDate,
        dueTime,
        status: "todo",
        priority,
        taskType,
        notes: notes.replace(/<[^>]*>/g, "").trim() ? notes : undefined,
        studentId: student.id,
        studentName: student.name,
        studentCode: student.code,
        studentInitials: student.initials,
        studentMajor: student.major,
      });
      toast.success(`Đã tạo task cho ${student.name}.`);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tạo task.",
      );
    }
  };

  return (
    <SheetOverlay isOpen={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader className="border-b border-card-border pb-4">
          <SheetTitle className="text-2xl">Tạo task</SheetTitle>
          <p className="text-sm text-text-secondary">
            Tạo công việc và gắn trực tiếp với một hồ sơ học sinh.
          </p>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-5 py-2">
          <TextField className="gap-2" required>
            <Label>Tên task *</Label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Nhập tên task..."
            />
          </TextField>

          <div className="flex flex-col gap-2">
            <TaskStudentSelect
              students={students}
              value={selectedStudentId}
              onChange={setStudentId}
              isDisabled={students.length === 0}
              isLoading={isLoadingStudents}
            />
            {studentsError && (
              <p className="text-sm text-input-error" role="alert">
                {studentsError.message || "Không thể tải danh sách học sinh."}
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <TextField className="gap-2" required>
              <Label>Hạn xử lý *</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </TextField>
            <TextField className="gap-2" required>
              <Label>Giờ xử lý *</Label>
              <Input
                type="time"
                value={dueTime}
                onChange={(event) => setDueTime(event.target.value)}
              />
            </TextField>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              value={taskType}
              onChange={(value) =>
                setTaskType(String(value) as StudentTaskType)
              }
              aria-label="Chọn loại task"
            >
              <SelectLabel>Loại task *</SelectLabel>
              <SelectTrigger className="w-full">
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                {taskTypeOptions.map((option) => (
                  <SelectItem
                    key={option}
                    id={option}
                    textValue={taskTypeLabel[option]}
                  >
                    {taskTypeLabel[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={priority}
              onChange={(value) =>
                setPriority(String(value) as StudentPriority)
              }
              aria-label="Chọn mức ưu tiên"
            >
              <SelectLabel>Mức ưu tiên</SelectLabel>
              <SelectTrigger className="w-full">
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option} id={option} textValue={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-card-border bg-background-gray-secondary/40 px-4 py-3">
            <p className="text-xs text-text-tertiary">Người phụ trách</p>
            <p className="mt-1 font-semibold text-text-primary">
              {assigneeName}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Người phụ trách chung của danh sách task, không thể chỉnh sửa.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Ghi chú task</Label>
            <RichTextEditor
              value={notes}
              onChange={setNotes}
              placeholder="Mô tả chi tiết công việc cần làm..."
            />
          </div>
        </SheetBody>
        <SheetFooter className="border-t border-card-border pt-4">
          <Button appearance="outline" onPress={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onPress={handleSubmit} isDisabled={!isValid || isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Tạo task"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </SheetOverlay>
  );
}
