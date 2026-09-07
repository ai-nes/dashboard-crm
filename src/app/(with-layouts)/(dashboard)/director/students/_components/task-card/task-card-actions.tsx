import { Check } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";

interface TaskCardActionsProps {
  isRescheduling: boolean;
  canComplete: boolean;
  onCancelRescheduling: () => void;
  onSaveRescheduling: () => void;
  onComplete: () => void;
}

export default function TaskCardActions({
  isRescheduling,
  canComplete,
  onCancelRescheduling,
  onSaveRescheduling,
  onComplete,
}: TaskCardActionsProps) {
  return (
    <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border-primary px-4 py-4 sm:px-5">
      {isRescheduling ? (
        <>
          <Button
            size="sm"
            appearance="ghost"
            variant="ghost"
            onPress={onCancelRescheduling}
          >
            Hủy
          </Button>
          <Button size="sm" appearance="outline" onPress={onSaveRescheduling}>
            Lưu lịch
          </Button>
        </>
      ) : null}

      <Button
        size="md"
        variant="primary"
        onPress={onComplete}
        isDisabled={!canComplete}
      >
        <Check size={16} aria-hidden="true" />
        {canComplete ? "Hoàn thành task" : "Task đã hoàn thành"}
      </Button>
    </footer>
  );
}
