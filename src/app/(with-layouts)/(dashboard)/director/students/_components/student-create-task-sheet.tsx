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
import type { StudentPriority, StudentTaskItem, StudentTaskType } from "@/services/api/students/types";
import { formatDate } from "@/utils/format-date";

import { taskTypeLabel } from "./student-task-badges";

interface StudentCreateTaskSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  assignee: string;
  onCreate: (task: StudentTaskItem) => void;
}

const priorityOptions: StudentPriority[] = ["Cao", "Trung bình", "Thấp"];
const taskTypeOptions: StudentTaskType[] = ["call", "email", "todo"];

export default function StudentCreateTaskSheet({
  isOpen,
  onOpenChange,
  studentName,
  assignee,
  onCreate,
}: StudentCreateTaskSheetProps) {
  const formId = useId();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<StudentPriority>("Trung bình");
  const [taskType, setTaskType] = useState<StudentTaskType>("todo");
  const [notes, setNotes] = useState("");

  const isValid = title.trim().length > 0 && dueDate.trim().length > 0 && dueTime.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;

    const [year, month, day] = dueDate.split("-");

    onCreate({
      id: `task-${formId}-${Date.now()}`,
      title: title.trim(),
      assignee,
      dueDate: year && month && day ? `${day}/${month}/${year}` : formatDate(dueDate),
      dueTime,
      status: "todo",
      priority,
      taskType,
      notes: notes.replace(/<[^>]*>/g, "").trim().length > 0 ? notes : undefined,
    });
    toast.success(`Đã tạo task cho ${studentName}.`);
    setTitle("");
    setDueDate("");
    setDueTime("");
    setPriority("Trung bình");
    setTaskType("todo");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <SheetOverlay isOpen={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Task cho {studentName}</SheetTitle>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-4">
          <TextField className="gap-2">
            <Label>Tên task</Label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Nhập tên task..."
            />
          </TextField>

          <div className="grid grid-cols-2 gap-3">
            <TextField className="gap-2">
              <Label>Hạn xử lý</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </TextField>

            <TextField className="gap-2">
              <Label>Giờ xử lý</Label>
              <Input
                type="time"
                value={dueTime}
                onChange={(event) => setDueTime(event.target.value)}
              />
            </TextField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              value={taskType}
              onChange={(key) => setTaskType(String(key) as StudentTaskType)}
            >
              <SelectLabel>Loại task</SelectLabel>
              <SelectTrigger className="w-full">
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent className="min-w-44">
                {taskTypeOptions.map((option) => (
                  <SelectItem key={option} id={option} textValue={taskTypeLabel[option]}>
                    {taskTypeLabel[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-col gap-2">
              <Select
                value={priority}
                onChange={(key) => setPriority(String(key) as StudentPriority)}
              >
                <SelectLabel>Mức ưu tiên</SelectLabel>
                <SelectTrigger className="w-full">
                  <SelectValue />
                  <SelectIndicator />
                </SelectTrigger>
                <SelectContent className="min-w-44">
                  {priorityOptions.map((option) => (
                    <SelectItem key={option} id={option} textValue={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg bg-background-gray-secondary/60 px-3 py-2.5">
            <p className="text-xs text-text-tertiary">Người phụ trách</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">{assignee}</p>
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
        <SheetFooter>
          <Button appearance="outline" onPress={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onPress={handleSubmit} isDisabled={!isValid}>
            Tạo task
          </Button>
        </SheetFooter>
      </SheetContent>
    </SheetOverlay>
  );
}
