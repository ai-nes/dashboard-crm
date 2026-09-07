import { Check } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import type { StudentTaskItem } from "@/services/api/students/types";
import { cn } from "@/utils/cn";

interface TaskCardQuickStatusButtonProps {
  status: StudentTaskItem["status"];
  overdue: boolean;
  onPress: () => void;
}

export default function TaskCardQuickStatusButton({
  status,
  overdue,
  onPress,
}: TaskCardQuickStatusButtonProps) {
  const isDone = status === "done";

  return (
    <Button
      variant="success"
      appearance={isDone ? "fill" : "outline"}
      iconOnly
      size="sm"
      onPress={onPress}
      aria-label={
        isDone
          ? "Đánh dấu chưa hoàn thành"
          : status === "canceled"
            ? "Khôi phục task"
            : "Đánh dấu hoàn thành"
      }
      className={cn(
        "size-9 shrink-0 rounded-full",
        !isDone && "bg-card-background text-text-secondary",
        overdue && !isDone && "border-error-500 text-error-500",
      )}
    >
      <Check size={17} />
    </Button>
  );
}
