"use client";

import TaskCreateDialogShell from "@/app/(with-layouts)/(dashboard)/director/tasks/_components/task-create-dialog-shell";
import TaskCreateForm, {
  type TaskCreateFormValues,
} from "@/app/(with-layouts)/(dashboard)/director/tasks/_components/task-create-form";

interface SegmentTaskCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  segmentName: string;
  isSubmitting?: boolean;
  onSubmit: (values: TaskCreateFormValues) => void | Promise<void>;
}

export default function SegmentTaskCreateDialog({
  isOpen,
  onOpenChange,
  segmentName,
  isSubmitting = false,
  onSubmit,
}: SegmentTaskCreateDialogProps) {
  const handleSubmit = async (values: TaskCreateFormValues) => {
    await onSubmit(values);
    onOpenChange(false);
  };

  return (
    <TaskCreateDialogShell
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      ariaLabel={`Tạo task cho segment ${segmentName}`}
    >
      <TaskCreateForm
        contextLabel={segmentName || "Segment"}
        heading="Task mới"
        parentLabel="Segment"
        studentField={
          <div className="flex h-9 items-center px-0 text-sm font-medium text-text-primary">
            {segmentName || "Segment hiện tại"}
          </div>
        }
        assigneeName="Chưa phân công"
        hideAssignee
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
      />
    </TaskCreateDialogShell>
  );
}
