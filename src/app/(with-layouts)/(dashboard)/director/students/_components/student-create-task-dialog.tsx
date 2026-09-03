"use client";

import { useId, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import {
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { Backdrop, OverlayWrapper } from "@/components/tailgrids/core/overlay";
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
import { TextField } from "@/components/tailgrids/core/text-field";
import type {
  StudentPriority,
  StudentTaskItem,
  StudentTaskType,
} from "@/services/api/students/types";
import { formatDate } from "@/utils/format-date";
import { Close } from "@tailgrids/icons";
import {
  Dialog as AriaDialog,
  Modal as AriaModal,
} from "react-aria-components";

import { taskTypeLabel } from "./student-task-badges";

interface StudentCreateTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  assignee: string;
  onCreate: (task: StudentTaskItem) => void;
}

const priorityOptions: StudentPriority[] = ["Cao", "Trung bình", "Thấp"];
const taskTypeOptions: StudentTaskType[] = ["call", "email", "todo"];

export default function StudentCreateTaskDialog({
  isOpen,
  onOpenChange,
  studentName,
  assignee,
  onCreate,
}: StudentCreateTaskDialogProps) {
  const formId = useId();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<StudentPriority>("Trung bình");
  const [taskType, setTaskType] = useState<StudentTaskType>("todo");
  const [notes, setNotes] = useState("");

  const isValid =
    title.trim().length > 0 &&
    dueDate.trim().length > 0 &&
    dueTime.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;

    const [year, month, day] = dueDate.split("-");

    onCreate({
      id: `task-${formId}-${Date.now()}`,
      title: title.trim(),
      assignee,
      dueDate:
        year && month && day ? `${day}/${month}/${year}` : formatDate(dueDate),
      dueTime,
      status: "todo",
      priority,
      taskType,
      notes:
        notes.replace(/<[^>]*>/g, "").trim().length > 0 ? notes : undefined,
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
    <OverlayWrapper isOpen={isOpen} onOpenChange={onOpenChange}>
      <Backdrop>
        <AriaModal className="fixed top-1/2 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] data-entering:scale-95 data-entering:opacity-0 data-exiting:scale-95 data-exiting:opacity-0 motion-reduce:transition-none motion-reduce:data-entering:scale-100 motion-reduce:data-entering:opacity-100 motion-reduce:data-exiting:scale-100 motion-reduce:data-exiting:opacity-100 max-sm:max-w-[calc(100%-2rem)]">
          <AriaDialog
            aria-label={`Tạo task cho ${studentName}`}
            className="relative flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border border-border-primary bg-background-white-primary shadow-lg outline-none"
          >
            <DialogClose
              iconOnly
              size="sm"
              variant="ghost"
              aria-label="Đóng"
              className="absolute top-4 right-4 z-10 text-text-100 opacity-70 hover:bg-transparent hover:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <Close />
            </DialogClose>
            <DialogHeader className="border-b border-card-border px-6 py-5 pr-14">
              <DialogTitle className="text-xl leading-7">
                Task cho {studentName}
              </DialogTitle>
              <DialogDescription className="text-text-tertiary">
                Tạo công việc tiếp theo và gán cho người phụ trách
              </DialogDescription>
            </DialogHeader>
            <DialogBody className="max-h-[calc(100vh-11rem)] overflow-y-auto px-6 py-5">
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
                  onChange={(key) =>
                    setTaskType(String(key) as StudentTaskType)
                  }
                >
                  <SelectLabel>Loại task</SelectLabel>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                    <SelectIndicator />
                  </SelectTrigger>
                  <SelectContent className="min-w-44">
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

                <div className="flex flex-col gap-2">
                  <Select
                    value={priority}
                    onChange={(key) =>
                      setPriority(String(key) as StudentPriority)
                    }
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
                <p className="mt-1 text-sm font-semibold text-text-primary">
                  {assignee}
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
            </DialogBody>
            <DialogFooter className="border-t border-card-border px-6 py-4">
              <Button appearance="outline" onPress={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button onPress={handleSubmit} isDisabled={!isValid}>
                Tạo task
              </Button>
            </DialogFooter>
          </AriaDialog>
        </AriaModal>
      </Backdrop>
    </OverlayWrapper>
  );
}
