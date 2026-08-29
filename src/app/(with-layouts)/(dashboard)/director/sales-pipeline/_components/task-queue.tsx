import { CheckCircle1, Close } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { cn } from "@/utils/cn";

import type { DailyTask } from "./types";

interface TaskQueueProps {
  tasks: DailyTask[];
  onClose: () => void;
  onComplete: (task: DailyTask) => void;
  onSelectTask: (task: DailyTask) => void;
}

export default function TaskQueue({ tasks, onClose, onComplete, onSelectTask }: TaskQueueProps) {
  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-card-border bg-background-100 p-4 shadow-lg sm:p-5" aria-label="Hàng đợi tác vụ hôm nay">
      <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-text-primary">Hàng đợi tác vụ</h2><p className="mt-1 text-sm text-text-secondary">{tasks.length} việc cần theo dõi hôm nay</p></div><Button appearance="ghost" iconOnly size="sm" onPress={onClose} aria-label="Đóng hàng đợi"><Close size={18} /></Button></div>
      <div className="mt-5 space-y-2 overflow-y-auto pb-4">
        {tasks.length ? tasks.map((task) => <Card key={task.id} className="p-3"><button type="button" className="w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500" onClick={() => onSelectTask(task)}><p className="text-sm font-medium text-text-primary">{task.title}</p><p className={cn("mt-1 text-xs", task.isOverdue ? "text-error-500" : "text-text-tertiary")}>{task.dueLabel}</p></button><Button variant="success" appearance="ghost" size="sm" className="mt-2" onPress={() => onComplete(task)}><CheckCircle1 size={16} />Hoàn thành</Button></Card>) : <div className="rounded-lg bg-badge-success-background p-5 text-center"><CheckCircle1 className="mx-auto text-success-500" size={24} /><p className="mt-2 text-sm font-semibold text-badge-success-text">Hôm nay không còn tác vụ mở</p><p className="mt-1 text-xs text-text-secondary">Bạn đã hoàn tất toàn bộ việc ưu tiên.</p></div>}
      </div>
    </aside>
  );
}
